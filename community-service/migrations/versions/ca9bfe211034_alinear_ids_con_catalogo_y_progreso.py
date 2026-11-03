"""Use service-wide string identifiers for catalog, user, and module IDs."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ca9bfe211034"
down_revision: Union[str, Sequence[str], None] = "881f425e2b8c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "resenas", "curso_id", existing_type=sa.Integer(),
        type_=sa.String(length=36), postgresql_using="curso_id::text", existing_nullable=False,
    )
    op.alter_column(
        "resenas", "estudiante_id", existing_type=sa.Integer(),
        type_=sa.String(length=100), postgresql_using="estudiante_id::text", existing_nullable=False,
    )
    op.alter_column(
        "moderaciones_resenas", "administrador_id", existing_type=sa.Integer(),
        type_=sa.String(length=100), postgresql_using="administrador_id::text", existing_nullable=False,
    )
    op.alter_column(
        "recompensas_modulos", "estudiante_id", existing_type=sa.Integer(),
        type_=sa.String(length=100), postgresql_using="estudiante_id::text", existing_nullable=False,
    )
    op.alter_column(
        "recompensas_modulos", "modulo_id", existing_type=sa.Integer(),
        type_=sa.String(length=36), postgresql_using="modulo_id::text", existing_nullable=False,
    )


def downgrade() -> None:
    raise RuntimeError(
        "Los IDs UUID no se pueden convertir con seguridad de vuelta a enteros. "
        "Restaura una copia de seguridad antes de volver a un esquema anterior."
    )
