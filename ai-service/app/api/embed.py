from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.processor import model

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/embed")
async def embed_query(request: QueryRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        # Generate a mathematical vector for the user's search query
        embedding = model.encode([request.query]).tolist()[0]
        return {"status": "success", "embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
