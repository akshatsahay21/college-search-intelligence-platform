from fastapi import FastAPI
from app.api.extract import router as extract_router
from app.api.embed import router as embed_router

app = FastAPI(title="College AI Service API", version="1.0.0")

app.include_router(extract_router, prefix="/api")
app.include_router(embed_router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "success", "message": "Python AI Processing Microservice is running!"}
