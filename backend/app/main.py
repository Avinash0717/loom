from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.workspace import router as workspace_router
from app.api.tools import router as tools_router
from app.api.user import router as user_router

app = FastAPI(
    title = "Loom Backend",
)

app.include_router(workspace_router)
app.include_router(tools_router)
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# files to delete: [init__db.py]

@app.get("/")
def root():
    return {"message": "Welcome to the Loom Backend"}