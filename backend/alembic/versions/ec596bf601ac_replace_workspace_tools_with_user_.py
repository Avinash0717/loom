"""replace workspace tools with user workspace tools

Revision ID: ec596bf601ac
Revises: ee39b96d4c06
Create Date: 2026-09-28 18:33:01.150360
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ec596bf601ac"
down_revision: Union[str, Sequence[str], None] = "ee39b96d4c06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "user_workspace_tools",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.String(length=50), nullable=False),
        sa.Column("tool_id", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["tool_id"], ["tools.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"]),
        sa.PrimaryKeyConstraint("user_id", "workspace_id", "tool_id"),
    )

    op.execute(
        """
        INSERT INTO user_workspace_tools (
            user_id,
            workspace_id,
            tool_id,
            enabled
        )
        SELECT
            users.id,
            workspace_tools.workspace_id,
            workspace_tools.tool_id,
            workspace_tools.enabled
        FROM workspace_tools
        CROSS JOIN users
        WHERE users.username = 'local_user'
        """
    )

    op.drop_table("workspace_tools")


def downgrade() -> None:
    """Downgrade schema."""

    op.create_table(
        "workspace_tools",
        sa.Column("workspace_id", sa.String(length=50), nullable=False),
        sa.Column("tool_id", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["tool_id"], ["tools.id"]),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"]),
        sa.PrimaryKeyConstraint("workspace_id", "tool_id"),
    )

    op.execute(
        """
        INSERT INTO workspace_tools (
            workspace_id,
            tool_id,
            enabled
        )
        SELECT
            workspace_id,
            tool_id,
            enabled
        FROM user_workspace_tools
        WHERE user_id = (
            SELECT id
            FROM users
            WHERE username = 'local_user'
        )
        """
    )

    op.drop_table("user_workspace_tools")