#!/bin/sh
set -eu

PGHOST="${PGHOST:-postgres}"
PGUSER="${POSTGRES_USER:-microservicios}"
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
export PGHOST PGUSER PGPASSWORD

until pg_isready -h "$PGHOST" -U "$PGUSER" -d postgres >/dev/null 2>&1; do
  sleep 2
done

for database in catalogo_db comunidad_db; do
  exists="$(psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$database'")"
  if [ "$exists" != "1" ]; then
    createdb "$database"
    echo "Base creada: $database"
  else
    echo "Base existente: $database"
  fi
done

community_schema="$(psql -d comunidad_db -tAc "SELECT to_regclass('public.alembic_version') IS NOT NULL")"
if [ "$community_schema" != "t" ]; then
  echo "Restaurando esquema inicial de comunidad..."
  psql -d comunidad_db -v ON_ERROR_STOP=1 -f /seed/comunidad.sql
else
  echo "El esquema de comunidad ya existe; se conserva y Alembic lo actualizará."
fi
