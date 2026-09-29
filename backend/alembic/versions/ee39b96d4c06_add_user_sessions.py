"""add user sessions

Revision ID: ee39b96d4c06

Revises: 7b2fbaa3b79b

Create Date: 2026-09-28 10:07:06.177847
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ee39b96d4c06"
down_revision: Union[str, Sequence[str], None] = "7b2fbaa3b79b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add the column temporarily as nullable so SQLite accepts it.
    op.add_column(
        "sessions",
        sa.Column(
            "last_seen_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # Existing sessions were already created, so use their
    # creation time as their initial last-seen time.
    op.execute(
        sa.text(
            "UPDATE sessions "
            "SET last_seen_at = created_at "
            "WHERE last_seen_at IS NULL"
        )
    )

    # logout_at can safely be nullable.
    op.add_column(
        "sessions",
        sa.Column(
            "logout_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # Now that all existing rows have a value, make last_seen_at required.
    with op.batch_alter_table("sessions") as batch_op:
        batch_op.alter_column(
            "last_seen_at",
            existing_type=sa.DateTime(),
            nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""

    with op.batch_alter_table("sessions") as batch_op:
        batch_op.drop_column("logout_at")
        batch_op.drop_column("last_seen_at")