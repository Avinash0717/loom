from fastapi import FastAPI

app = FastAPI(
    title = "Loom Backend"
)

@app.get("/")
def root():
    return {"message": "Welcome to the Loom Backend"}