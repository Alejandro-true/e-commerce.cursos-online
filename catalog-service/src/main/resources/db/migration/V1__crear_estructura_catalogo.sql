-- AulaBreve / CatologoService
-- Migracion V1: esquema propio del microservicio (PostgreSQL 17)
-- Ejecutar exclusivamente mediante Flyway; no ejecutar manualmente en pgAdmin.
-- La BD de desarrollo confirmada en los logs del proyecto es catalogo_db.
-- No hay referencias ni FK a bases de datos de otros microservicios.

-- 01. CATEGORIAS
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_categorias_nombre CHECK (btrim(nombre) <> '')
);
CREATE UNIQUE INDEX uq_categorias_nombre_ci ON categorias (lower(btrim(nombre)));

-- 02. ETIQUETAS
CREATE TABLE etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL,
    slug VARCHAR(60) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_etiquetas_nombre CHECK (btrim(nombre) <> ''),
    CONSTRAINT ck_etiquetas_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- 03. CURSOS
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    titulo VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel VARCHAR(20) NOT NULL,
    miniatura_url VARCHAR(500),
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_cursos_titulo CHECK (btrim(titulo) <> ''),
    CONSTRAINT ck_cursos_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT ck_cursos_nivel CHECK (nivel IN ('BASICO', 'INTERMEDIO', 'AVANZADO')),
    CONSTRAINT ck_cursos_estado CHECK (estado IN ('BORRADOR', 'PUBLICADO', 'ARCHIVADO'))
);
CREATE INDEX idx_cursos_categoria_estado ON cursos(categoria_id, estado);
CREATE INDEX idx_cursos_estado ON cursos(estado);

-- 04. CURSO_ETIQUETAS
CREATE TABLE curso_etiquetas (
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE RESTRICT,
    PRIMARY KEY (curso_id, etiqueta_id)
);
CREATE INDEX idx_curso_etiquetas_etiqueta ON curso_etiquetas(etiqueta_id);

-- 05. CURSO_INSTRUCTORES
-- instructor_id es externo: no existe una tabla local de cuentas/usuarios.
CREATE TABLE curso_instructores (
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    instructor_id VARCHAR(150) NOT NULL,
    PRIMARY KEY (curso_id, instructor_id),
    CONSTRAINT ck_curso_instructores_id CHECK (btrim(instructor_id) <> '')
);

-- 06. PRECIOS_PROMOCIONES
CREATE TABLE precios_promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL UNIQUE REFERENCES cursos(id) ON DELETE RESTRICT,
    precio_base NUMERIC(10,2) NOT NULL,
    precio_oferta NUMERIC(10,2),
    moneda VARCHAR(3) NOT NULL,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_precios_base CHECK (precio_base > 0),
    CONSTRAINT ck_precios_oferta CHECK
        (precio_oferta IS NULL OR (precio_oferta > 0 AND precio_oferta < precio_base)),
    CONSTRAINT ck_precios_moneda CHECK (moneda IN ('PEN', 'USD')),
    CONSTRAINT ck_precios_periodo CHECK (
        (precio_oferta IS NULL AND fecha_inicio IS NULL AND fecha_fin IS NULL)
        OR (precio_oferta IS NOT NULL AND fecha_inicio IS NOT NULL
            AND fecha_fin IS NOT NULL AND fecha_fin > fecha_inicio)
    )
);

-- 07. CURSO_VERSIONES
CREATE TABLE curso_versiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
    numero_version VARCHAR(10) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    es_version_ofertada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_publicacion TIMESTAMPTZ,
    CONSTRAINT uq_curso_version_num UNIQUE (curso_id, numero_version),
    CONSTRAINT uq_curso_version_id_curso UNIQUE (id, curso_id),
    CONSTRAINT ck_curso_version_num CHECK (btrim(numero_version) <> ''),
    CONSTRAINT ck_curso_version_estado CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'RETIRADA')),
    CONSTRAINT ck_curso_version_ofertada CHECK (NOT es_version_ofertada OR estado = 'PUBLICADA'),
    CONSTRAINT ck_curso_version_fecha CHECK (
        (estado = 'BORRADOR' AND fecha_publicacion IS NULL)
        OR (estado IN ('PUBLICADA', 'RETIRADA') AND fecha_publicacion IS NOT NULL)
    )
);
CREATE UNIQUE INDEX uq_version_ofertada_por_curso ON curso_versiones(curso_id)
    WHERE es_version_ofertada = TRUE;
CREATE INDEX idx_curso_versiones_curso_estado ON curso_versiones(curso_id, estado);

-- 08. MODULOS
CREATE TABLE modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_version_id UUID NOT NULL REFERENCES curso_versiones(id) ON DELETE RESTRICT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    CONSTRAINT uq_modulos_version_orden UNIQUE (curso_version_id, orden),
    CONSTRAINT ck_modulos_orden CHECK (orden > 0),
    CONSTRAINT ck_modulos_titulo CHECK (btrim(titulo) <> '')
);

-- 09. LECCIONES
CREATE TABLE lecciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE RESTRICT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL,
    contenido_texto TEXT,
    video_referencia VARCHAR(255),
    estado_video VARCHAR(20) NOT NULL DEFAULT 'NO_APLICA',
    duracion_segundos INTEGER,
    obligatorio BOOLEAN NOT NULL DEFAULT TRUE,
    orden INTEGER NOT NULL,
    CONSTRAINT uq_lecciones_modulo_orden UNIQUE (modulo_id, orden),
    CONSTRAINT ck_lecciones_titulo CHECK (btrim(titulo) <> ''),
    CONSTRAINT ck_lecciones_tipo CHECK (tipo IN ('VIDEO', 'LECTURA')),
    CONSTRAINT ck_lecciones_estado_video CHECK
        (estado_video IN ('NO_APLICA', 'PENDIENTE', 'PROCESANDO', 'LISTO', 'ERROR')),
    CONSTRAINT ck_lecciones_orden CHECK (orden > 0),
    CONSTRAINT ck_lecciones_duracion CHECK
        (duracion_segundos IS NULL OR duracion_segundos >= 0),
    CONSTRAINT ck_lecciones_video_referencia CHECK (
        (tipo = 'LECTURA' AND estado_video = 'NO_APLICA' AND video_referencia IS NULL)
        OR tipo = 'VIDEO'
    ),
    CONSTRAINT ck_lecciones_video_listo CHECK
        (estado_video <> 'LISTO' OR (tipo = 'VIDEO' AND nullif(btrim(video_referencia), '') IS NOT NULL))
);

-- 10. RECURSOS_LECCION
CREATE TABLE recursos_leccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    archivo_referencia VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(15) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_recursos_nombre CHECK (btrim(nombre) <> ''),
    CONSTRAINT ck_recursos_referencia CHECK (btrim(archivo_referencia) <> ''),
    CONSTRAINT ck_recursos_tipo CHECK (tipo_archivo IN ('PDF', 'ZIP', 'DOCX'))
);
CREATE INDEX idx_recursos_leccion_leccion ON recursos_leccion(leccion_id);

-- 11. COMPRAS
-- Los IDs de estudiante son externos; no hay FK a otro servicio.
CREATE TABLE compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id VARCHAR(150) NOT NULL,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE RESTRICT,
    curso_version_id UUID NOT NULL,
    proveedor_checkout VARCHAR(50) NOT NULL,
    checkout_sesion_id VARCHAR(150),
    pedido_externo_id VARCHAR(150),
    monto_total NUMERIC(10,2) NOT NULL,
    moneda VARCHAR(3) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    revision_comercial BIGINT NOT NULL DEFAULT 0,
    fecha_compra TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMPTZ,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compras_version_curso FOREIGN KEY (curso_version_id, curso_id)
        REFERENCES curso_versiones(id, curso_id) ON DELETE RESTRICT,
    CONSTRAINT uq_compras_sesion UNIQUE (proveedor_checkout, checkout_sesion_id),
    CONSTRAINT uq_compras_pedido UNIQUE (proveedor_checkout, pedido_externo_id),
    CONSTRAINT uq_compras_identidad UNIQUE (id, estudiante_id, curso_id, curso_version_id),
    CONSTRAINT ck_compras_estudiante CHECK (btrim(estudiante_id) <> ''),
    CONSTRAINT ck_compras_proveedor CHECK (btrim(proveedor_checkout) <> ''),
    CONSTRAINT ck_compras_monto CHECK (monto_total > 0),
    CONSTRAINT ck_compras_moneda CHECK (moneda IN ('PEN', 'USD')),
    CONSTRAINT ck_compras_estado CHECK
        (estado IN ('PENDIENTE', 'PAGADO', 'FALLIDO', 'CANCELADO', 'REEMBOLSADO')),
    CONSTRAINT ck_compras_revision CHECK (revision_comercial >= 0)
);
CREATE INDEX idx_compras_estudiante_fecha ON compras(estudiante_id, fecha_compra DESC);
CREATE INDEX idx_compras_curso_estado ON compras(curso_id, estado);

-- 12. EVENTOS_PAGO
-- Solo registrar contenido no sensible y eventos previamente autenticados.
CREATE TABLE eventos_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE RESTRICT,
    proveedor VARCHAR(50) NOT NULL,
    evento_externo_id VARCHAR(150) NOT NULL,
    transaccion_externa_id VARCHAR(150),
    tipo_evento VARCHAR(50) NOT NULL,
    version_estado_externo BIGINT,
    resultado_procesamiento VARCHAR(30) NOT NULL,
    payload_resumen JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_evento_proveedor TIMESTAMPTZ,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_eventos_pago_proveedor_id UNIQUE (proveedor, evento_externo_id),
    CONSTRAINT ck_eventos_pago_tipo CHECK
        (tipo_evento IN ('PAGO_CONFIRMADO', 'PAGO_RECHAZADO', 'REEMBOLSO_CONFIRMADO')),
    CONSTRAINT ck_eventos_pago_resultado CHECK
        (resultado_procesamiento IN ('PROCESADO', 'IGNORADO', 'RECHAZADO')),
    CONSTRAINT ck_eventos_pago_payload CHECK (jsonb_typeof(payload_resumen) = 'object'),
    CONSTRAINT ck_eventos_pago_version CHECK
        (version_estado_externo IS NULL OR version_estado_externo >= 0),
    CONSTRAINT ck_eventos_pago_ids CHECK
        (btrim(proveedor) <> '' AND btrim(evento_externo_id) <> '')
);
CREATE INDEX idx_eventos_pago_compra_fecha ON eventos_pago(compra_id, fecha_registro DESC);
CREATE INDEX idx_eventos_pago_transaccion ON eventos_pago(transaccion_externa_id)
    WHERE transaccion_externa_id IS NOT NULL;

-- 13. DERECHOS_ACCESO
CREATE TABLE derechos_acceso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID NOT NULL UNIQUE,
    estudiante_id VARCHAR(150) NOT NULL,
    curso_id UUID NOT NULL,
    curso_version_id UUID NOT NULL,
    estado_acceso VARCHAR(20) NOT NULL,
    fecha_otorgamiento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion TIMESTAMPTZ,
    fecha_expiracion TIMESTAMPTZ,
    motivo_revocacion VARCHAR(150),
    CONSTRAINT fk_derechos_compra_identidad
        FOREIGN KEY (compra_id, estudiante_id, curso_id, curso_version_id)
        REFERENCES compras(id, estudiante_id, curso_id, curso_version_id) ON DELETE RESTRICT,
    CONSTRAINT ck_derechos_estado CHECK (estado_acceso IN ('ACTIVO', 'REVOCADO', 'EXPIRADO')),
    CONSTRAINT ck_derechos_estudiante CHECK (btrim(estudiante_id) <> ''),
    CONSTRAINT ck_derechos_fechas CHECK
        (fecha_expiracion IS NULL OR fecha_expiracion > fecha_otorgamiento),
    CONSTRAINT ck_derechos_revocacion CHECK (
        (estado_acceso = 'REVOCADO' AND fecha_revocacion IS NOT NULL)
        OR (estado_acceso <> 'REVOCADO' AND fecha_revocacion IS NULL)
    )
);
CREATE UNIQUE INDEX uq_derechos_activos_estudiante_version
    ON derechos_acceso(estudiante_id, curso_version_id) WHERE estado_acceso = 'ACTIVO';
CREATE INDEX idx_derechos_estudiante_estado ON derechos_acceso(estudiante_id, estado_acceso);
CREATE INDEX idx_derechos_curso_estado ON derechos_acceso(curso_id, estado_acceso);

-- PROTECCION DE VERSIONES PUBLICADAS / RETIRADAS
-- Una version publicada conserva su identidad y su fecha original de publicacion.
CREATE OR REPLACE FUNCTION proteger_curso_version_publicada()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se puede eliminar una version publicada o retirada';
        END IF;
        RETURN OLD;
    END IF;
    IF OLD.estado IN ('PUBLICADA', 'RETIRADA') THEN
        IF NEW.curso_id IS DISTINCT FROM OLD.curso_id
           OR NEW.numero_version IS DISTINCT FROM OLD.numero_version
           OR NEW.fecha_creacion IS DISTINCT FROM OLD.fecha_creacion
           OR NEW.fecha_publicacion IS DISTINCT FROM OLD.fecha_publicacion THEN
            RAISE EXCEPTION 'No se permite cambiar la identidad o fechas de una version publicada';
        END IF;
        IF NEW.estado = 'BORRADOR'
           OR (OLD.estado = 'RETIRADA' AND NEW.estado <> 'RETIRADA') THEN
            RAISE EXCEPTION 'Transicion de estado de version no permitida';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_proteger_curso_version
BEFORE UPDATE OR DELETE ON curso_versiones
FOR EACH ROW EXECUTE FUNCTION proteger_curso_version_publicada();

-- Bloqueos FOR SHARE serializan modificaciones estructurales frente a la
-- publicacion concurrente de una version (que toma bloqueo de UPDATE).
CREATE OR REPLACE FUNCTION proteger_modulos_publicados()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_estado VARCHAR(20);
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT estado INTO v_estado FROM curso_versiones
        WHERE id = OLD.curso_version_id FOR SHARE;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden modificar modulos de una version publicada';
        END IF;
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT estado INTO v_estado FROM curso_versiones
        WHERE id = NEW.curso_version_id FOR SHARE;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden agregar/mover modulos a una version publicada';
        END IF;
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_proteger_modulos
BEFORE INSERT OR UPDATE OR DELETE ON modulos
FOR EACH ROW EXECUTE FUNCTION proteger_modulos_publicados();

CREATE OR REPLACE FUNCTION proteger_lecciones_publicadas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_estado VARCHAR(20);
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT v.estado INTO v_estado
        FROM modulos m JOIN curso_versiones v ON v.id = m.curso_version_id
        WHERE m.id = OLD.modulo_id FOR SHARE OF v;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden modificar lecciones de una version publicada';
        END IF;
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT v.estado INTO v_estado
        FROM modulos m JOIN curso_versiones v ON v.id = m.curso_version_id
        WHERE m.id = NEW.modulo_id FOR SHARE OF v;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden agregar/mover lecciones a una version publicada';
        END IF;
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_proteger_lecciones
BEFORE INSERT OR UPDATE OR DELETE ON lecciones
FOR EACH ROW EXECUTE FUNCTION proteger_lecciones_publicadas();

CREATE OR REPLACE FUNCTION proteger_recursos_publicados()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_estado VARCHAR(20);
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT v.estado INTO v_estado FROM lecciones l
        JOIN modulos m ON m.id = l.modulo_id
        JOIN curso_versiones v ON v.id = m.curso_version_id
        WHERE l.id = OLD.leccion_id FOR SHARE OF v;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden modificar recursos de una version publicada';
        END IF;
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT v.estado INTO v_estado FROM lecciones l
        JOIN modulos m ON m.id = l.modulo_id
        JOIN curso_versiones v ON v.id = m.curso_version_id
        WHERE l.id = NEW.leccion_id FOR SHARE OF v;
        IF v_estado <> 'BORRADOR' THEN
            RAISE EXCEPTION 'No se pueden agregar/mover recursos a una version publicada';
        END IF;
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_proteger_recursos
BEFORE INSERT OR UPDATE OR DELETE ON recursos_leccion
FOR EACH ROW EXECUTE FUNCTION proteger_recursos_publicados();

-- REGLAS QUE SE IMPLEMENTARAN EN CAPA SERVICE CON TRANSACCIONES:
-- RN01: solo listar cursos PUBLICADOS con version ofertada PUBLICADA.
-- RN02: antes de publicar validar precio, descripcion, modulo y video obligatorio LISTO.
-- RN03: tomar estudiante_id de la identidad validada, no del cuerpo del request.
-- RN04: conceder acceso solo tras verificar firma/importe/estado del checkout externo.
-- RN05: procesar webhooks idempotentes y aplicar estado comercial mas reciente.
-- RN06: revocar accesos ante reembolso, sin modificar la BD de Progreso.
-- RN09: crear nueva version si cambia la estructura de una publicada.
-- La BD no sustituye autenticacion, verificacion de webhooks ni transacciones de negocio.
