from app.db.database import Base, engine
from app.models import Workspace, Component, WorkspaceComponent

def init_db():
    Base.metadata.create_all(bind=engine)