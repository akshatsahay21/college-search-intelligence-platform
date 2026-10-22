from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.processor import process_document

router = APIRouter()

@router.post("/extract")
async def extract_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        contents = await file.read()
        chunks = process_document(contents)
        return {"status": "success", "total_chunks": len(chunks), "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
