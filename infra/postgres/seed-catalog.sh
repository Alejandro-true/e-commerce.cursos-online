#!/bin/sh
set -eu

export PGHOST="${PGHOST:-postgres}"
export PGUSER="${POSTGRES_USER:-microservicios}"
export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

echo "Esperando a que Catalog termine las migraciones Flyway..."
attempt=0
until psql -d catalogo_db -tAc "SELECT to_regclass('public.cursos') IS NOT NULL AND to_regclass('public.flyway_schema_history') IS NOT NULL AND EXISTS (SELECT 1 FROM public.flyway_schema_history WHERE success)" 2>/dev/null | grep -q '^t$'; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 120 ]; then
    echo "Catalog no terminó sus migraciones en 4 minutos." >&2
    exit 1
  fi
  sleep 2
done

echo "Cargando cursos de demostración (el script omite duplicados)..."
psql -d catalogo_db -v ON_ERROR_STOP=1 -f /seed/demo_catalogo.sql
