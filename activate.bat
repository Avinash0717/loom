[35malembic/env.py[m[36m:[m[32m9[m[36m:[mfrom app.models import [1;31mWorkspace[m, Tool, [1;31mUserWorkspaceTool[m, User, Session
[35malembic/versions/617912995956_add_app_state.py[m[36m:[m[32m26[m[36m:[m    sa.Column('[1;31mactive_workspace_id[m', sa.String(length=50), nullable=False),
[35malembic/versions/7b2fbaa3b79b_remove_app_state.py[m[36m:[m[32m33[m[36m:[m    sa.Column('[1;31mactive_workspace_id[m', sa.VARCHAR(length=50), nullable=False),
[35malembic/versions/b18c726f46fb_add_users.py[m[36m:[m[32m29[m[36m:[m    sa.Column('[1;31mactive_workspace_id[m', sa.String(length=50), nullable=False),
[35malembic/versions/b18c726f46fb_add_users.py[m[36m:[m[32m30[m[36m:[m    sa.ForeignKeyConstraint(['[1;31mactive_workspace_id[m'], ['workspaces.id'], ),
[35mapp/api/tools.py[m[36m:[m[32m6[m[36m:[mfrom app.models import Tool, User, [1;31mUserWorkspaceTool[m
[35mapp/api/tools.py[m[36m:[m[32m31[m[36m:[m        select([1;31mUserWorkspaceTool[m).where(
[35mapp/api/tools.py[m[36m:[m[32m32[m[36m:[m            [1;31mUserWorkspaceTool[m.user_id == user.id,
[35mapp/api/tools.py[m[36m:[m[32m33[m[36m:[m            [1;31mUserWorkspaceTool[m.workspace_id == user.[1;31mactive_workspace_id[m,
[35mapp/api/tools.py[m[36m:[m[32m34[m[36m:[m            [1;31mUserWorkspaceTool[m.tool_id == tool_id,
[35mapp/api/user.py[m[36m:[m[32m42[m[36m:[m        [1;31mactive_workspace_id[m="default"
[35mapp/api/user.py[m[36m:[m[32m64[m[36m:[m            "[1;31mactive_workspace_id[m": user.[1;31mactive_workspace_id[m
[35mapp/api/user.py[m[36m:[m[32m102[m[36m:[m            "[1;31mactive_workspace_id[m": user.[1;31mactive_workspace_id[m
[35mapp/api/workspace.py[m[36m:[m[32m6[m[36m:[mfrom app.db.workspace_defaults import [1;31mWORKSPACE_DEFAULT_CONFIG[m
[35mapp/api/workspace.py[m[36m:[m[32m7[m[36m:[mfrom app.models import [1;31mWorkspace[m, [1;31mUserWorkspaceTool[m, User
[35mapp/api/workspace.py[m[36m:[m[32m8[m[36m:[mfrom app.schemas.workspace import [1;31mWorkspace[mUpdate
[35mapp/api/workspace.py[m[36m:[m[32m12[m[36m:[m    prefix="/api/v1[1;31m/workspace[m",
[35mapp/api/workspace.py[m[36m:[m[32m13[m[36m:[m    tags=["[1;31mWorkspace[m"]
[35mapp/api/workspace.py[m[36m:[m[32m23[m[36m:[m        select([1;31mWorkspace[m)
[35mapp/api/workspace.py[m[36m:[m[32m30[m[36m:[m            select([1;31mUserWorkspaceTool[m).where(
[35mapp/api/workspace.py[m[36m:[m[32m31[m[36m:[m                [1;31mUserWorkspaceTool[m.user_id == user.id,
[35mapp/api/workspace.py[m[36m:[m[32m32[m[36m:[m                [1;31mUserWorkspaceTool[m.workspace_id == workspace.id,
[35mapp/api/workspace.py[m[36m:[m[32m50[m[36m:[m        workspace for workspace in result if workspace["id"] == user.[1;31mactive_workspace_id[m
[35mapp/api/workspace.py[m[36m:[m[32m54[m[36m:[m        "active[1;31mWorkspace[m": active_workspace,
[35mapp/api/workspace.py[m[36m:[m[32m55[m[36m:[m        "available[1;31mWorkspace[ms": result
[35mapp/api/workspace.py[m[36m:[m[32m59[m[36m:[mdef [1;31mswitch_workspace[m(
[35mapp/api/workspace.py[m[36m:[m[32m60[m[36m:[m        data: [1;31mWorkspace[mUpdate,
[35mapp/api/workspace.py[m[36m:[m[32m65[m[36m:[m    workspace = db.get([1;31mWorkspace[m, data.workspaceId)
[35mapp/api/workspace.py[m[36m:[m[32m70[m[36m:[m            detail=f"[1;31mWorkspace[m '{data.workspaceId}' does not exist"
[35mapp/api/workspace.py[m[36m:[m[32m74[m[36m:[m        select([1;31mUserWorkspaceTool[m).where(
[35mapp/api/workspace.py[m[36m:[m[32m75[m[36m:[m            [1;31mUserWorkspaceTool[m.user_id == user.id,
[35mapp/api/workspace.py[m[36m:[m[32m76[m[36m:[m            [1;31mUserWorkspaceTool[m.workspace_id == workspace.id
[35mapp/api/workspace.py[m[36m:[m[32m84[m[36m:[m    tool_ids = [1;31mWORKSPACE_DEFAULT_CONFIG[m.get(workspace.id, [])
[35mapp/api/workspace.py[m[36m:[m[32m88[m[36m:[m            association = [1;31mUserWorkspaceTool[m(
[35mapp/api/workspace.py[m[36m:[m[32m97[m[36m:[m    user.[1;31mactive_workspace_id[m = data.workspaceId
[35mapp/api/workspace.py[m[36m:[m[32m102[m[36m:[m        "message": "[1;31mWorkspace[m switched successfully",
[35mapp/api/workspace.py[m[36m:[m[32m103[m[36m:[m        "active[1;31mWorkspace[m": data.workspaceId
[35mapp/db/init__db.py[m[36m:[m[32m2[m[36m:[mfrom app.models import [1;31mWorkspace[m, Component, [1;31mWorkspace[mComponent
[35mapp/db/seed.py[m[36m:[m[32m3[m[36m:[mfrom app.models import [1;31mWorkspace[m, Tool
[35mapp/db/seed.py[m[36m:[m[32m4[m[36m:[mfrom .workspace_defaults import WORKSPACES, TOOLS, [1;31mWORKSPACE_DEFAULT_CONFIG[m
[35mapp/db/seed.py[m[36m:[m[32m91[m[36m:[m        "description": "[1;31mWorkspace[m designed for students",
[35mapp/db/seed.py[m[36m:[m[32m102[m[36m:[m        "description": "[1;31mWorkspace[m designed for retail and shop management",
[35mapp/db/seed.py[m[36m:[m[32m137[m[36m:[m                select([1;31mWorkspace[m).where(
[35mapp/db/seed.py[m[36m:[m[32m138[m[36m:[m                    [1;31mWorkspace[m.id == workspace_data["id"]
[35mapp/db/seed.py[m[36m:[m[32m143[m[36m:[m                workspace = [1;31mWorkspace[m(
[35mapp/db/workspace_defaults.py[m[36m:[m[32m14[m[36m:[m[1;31mWORKSPACE_DEFAULT_CONFIG[m = {
[35mapp/models/__init__.py[m[36m:[m[32m1[m[36m:[mfrom .workspace import [1;31mWorkspace[m
[35mapp/models/__init__.py[m[36m:[m[32m3[m[36m:[mfrom .user_workspace_tool import [1;31mUserWorkspaceTool[m
[35mapp/models/__init__.py[m[36m:[m[32m8[m[36m:[m    "[1;31mWorkspace[m",
[35mapp/models/__init__.py[m[36m:[m[32m10[m[36m:[m    "[1;31mUserWorkspaceTool[m",
[35mapp/models/user.py[m[36m:[m[32m30[m[36m:[m    [1;31mactive_workspace_id[m: Mapped[str] = mapped_column(
[35mapp/models/user_workspace_tool.py[m[36m:[m[32m6[m[36m:[mclass [1;31mUserWorkspaceTool[m(Base):
[35mapp/models/workspace.py[m[36m:[m[32m6[m[36m:[mclass [1;31mWorkspace[m(Base):
[35mapp/schemas/workspace.py[m[36m:[m[32m3[m[36m:[mclass [1;31mWorkspace[mUpdate(BaseModel):
