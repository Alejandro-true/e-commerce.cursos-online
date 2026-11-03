-- AulaBreve / seed educativo para PostgreSQL Docker (no es una migracion Flyway)
-- Basado en V1__crear_estructura_catalogo.sql: V1/V2 deben existir previamente.
-- No crea usuarios, compras, pagos ni derechos_acceso.
-- Seguridad: solo inserta si la tabla cursos esta COMPLETAMENTE VACIA.
-- Si se ejecuta de nuevo no duplica cursos ni altera contenido publicado.
-- Refs demo:* requieren videos-demo/aulabreve-bienvenida.mp4 en classpath del backend.

BEGIN;

DO $seed$
DECLARE
    v_categoria UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM cursos) THEN
        RAISE NOTICE 'Seed omitido: ya existen cursos. No se modifico ningun dato.';
        RETURN;
    END IF;

    INSERT INTO categorias (nombre, descripcion, activo)
    VALUES ('Programacion DEMO', 'Categoria para cursos educativos de demostracion', TRUE)
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_categoria FROM categorias
    WHERE lower(btrim(nombre)) = lower('Programacion DEMO') LIMIT 1;
    IF v_categoria IS NULL THEN
        RAISE EXCEPTION 'No se pudo localizar la categoria DEMO';
    END IF;

    -- Primero crear el contenido en BORRADOR; los triggers protegen
    -- modulos y lecciones de versiones PUBLICADAS.
    INSERT INTO cursos (id, categoria_id, titulo, slug, descripcion, nivel, estado)
    VALUES
        ('b2000000-0000-4000-8000-000000000001', v_categoria, 'Introduccion a Java DEMO', 'aulabreve-demo-java', 'Curso introductorio de Java para comprobar el flujo de compra.', 'BASICO', 'BORRADOR'),
        ('b2000000-0000-4000-8000-000000000002', v_categoria, 'Python desde 0', 'aulabreve-demo-python', 'Aprende Python desde cero con ejemplos sencillos.', 'INTERMEDIO', 'BORRADOR'),
        ('b2000000-0000-4000-8000-000000000003', v_categoria, 'Word desde cero', 'aulabreve-demo-word', 'Aprende las funciones basicas de Word.', 'BASICO', 'BORRADOR');

    INSERT INTO precios_promociones (id, curso_id, precio_base, moneda)
    VALUES
        ('b6000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 149.90, 'PEN'),
        ('b6000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 100.00, 'PEN'),
        ('b6000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 50.00, 'PEN');

    INSERT INTO curso_versiones (id, curso_id, numero_version, estado, es_version_ofertada)
    VALUES
        ('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', '1.0', 'BORRADOR', FALSE),
        ('b3000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', '1.0', 'BORRADOR', FALSE),
        ('b3000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', '1.0', 'BORRADOR', FALSE);

    INSERT INTO modulos (id, curso_version_id, titulo, descripcion, orden)
    VALUES
        ('b4000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'Introduccion a Java', 'Modulo introductorio del curso', 1),
        ('b4000000-0000-4000-8000-000000000002', 'b3000000-0000-4000-8000-000000000002', 'Introduccion a Python', 'Modulo introductorio del curso', 1),
        ('b4000000-0000-4000-8000-000000000003', 'b3000000-0000-4000-8000-000000000003', 'Introduccion a Word', 'Modulo introductorio del curso', 1);

    INSERT INTO lecciones
       (id, modulo_id, titulo, descripcion, tipo, contenido_texto, video_referencia, estado_video, duracion_segundos, obligatorio, orden)
    VALUES
        ('b5000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'Bienvenida a Java', 'Video introductorio DEMO', 'VIDEO', NULL, 'demo:java-bienvenida', 'LISTO', 9, TRUE, 1),
        ('b5000000-0000-4000-8000-000000000002', 'b4000000-0000-4000-8000-000000000001', 'Primeros pasos en Java', 'Material de lectura', 'LECTURA', 'Java permite desarrollar aplicaciones multiplataforma.', NULL, 'NO_APLICA', NULL, TRUE, 2),
        ('b5000000-0000-4000-8000-000000000003', 'b4000000-0000-4000-8000-000000000002', 'Bienvenida a Python', 'Video introductorio DEMO', 'VIDEO', NULL, 'demo:python-bienvenida', 'LISTO', 9, TRUE, 1),
        ('b5000000-0000-4000-8000-000000000004', 'b4000000-0000-4000-8000-000000000002', 'Conceptos basicos', 'Material de lectura', 'LECTURA', 'Python es un lenguaje de programacion de alto nivel.', NULL, 'NO_APLICA', NULL, TRUE, 2),
        ('b5000000-0000-4000-8000-000000000005', 'b4000000-0000-4000-8000-000000000003', 'Bienvenida a Word', 'Video introductorio DEMO', 'VIDEO', NULL, 'demo:word-bienvenida', 'LISTO', 9, TRUE, 1),
        ('b5000000-0000-4000-8000-000000000006', 'b4000000-0000-4000-8000-000000000003', 'Crear un documento', 'Material de lectura', 'LECTURA', 'Comienza creando un documento y guardando los cambios.', NULL, 'NO_APLICA', NULL, TRUE, 2);

    -- Publicar solo cuando las lecciones requeridas ya existen.
    UPDATE curso_versiones SET estado = 'PUBLICADA', es_version_ofertada = TRUE, fecha_publicacion = CURRENT_TIMESTAMP
    WHERE id IN (
        'b3000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', 'b3000000-0000-4000-8000-000000000003'
    ) AND estado = 'BORRADOR';

    UPDATE cursos SET estado = 'PUBLICADO', fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id IN (
        'b2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000003'
    );

    RAISE NOTICE 'Seed insertado: 3 cursos, 3 versiones, 3 modulos, 6 lecciones y 3 precios';
END
$seed$;

COMMIT;

-- Verificacion (no modifica datos):
SELECT c.titulo, c.estado AS curso_estado, v.numero_version,
       v.estado AS version_estado, v.es_version_ofertada, p.precio_base, p.moneda
FROM cursos c
JOIN curso_versiones v ON v.curso_id = c.id
JOIN precios_promociones p ON p.curso_id = c.id
ORDER BY c.titulo;
