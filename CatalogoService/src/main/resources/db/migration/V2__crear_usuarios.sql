-- AulaBreve - Etapa 11.1
-- Cuentas persistentes de estudiantes y administradores.
-- No se modifica la migracion V1 ni el historial comercial existente.
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'ESTUDIANTE',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_usuarios_nombre_no_vacio CHECK (length(btrim(nombre)) > 0),
    CONSTRAINT ck_usuarios_email_normalizado CHECK (
        email = lower(btrim(email)) AND length(email) > 3 AND position('@' in email) > 1
    ),
    CONSTRAINT ck_usuarios_hash_no_vacio CHECK (length(btrim(password_hash)) > 0),
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('ESTUDIANTE', 'ADMIN'))
);

-- La unicidad debe mantenerse incluso si el registro recibiera mayusculas o espacios.
CREATE UNIQUE INDEX uq_usuarios_email_normalizado
    ON usuarios (lower(btrim(email)));

CREATE INDEX ix_usuarios_rol_activo
    ON usuarios (rol, activo);
