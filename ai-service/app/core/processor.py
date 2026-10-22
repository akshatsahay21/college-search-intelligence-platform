import pdfplumber
from sentence_transformers import SentenceTransformer
import io

# Load the embedding model (downloads on first run)
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file_bytes: bytes) -> list:
    """Extracts text from PDF and returns a list of dictionaries with page numbers."""
    pages_text = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages_text.append({"page_number": i + 1, "content": text})
    return pages_text

def chunk_text(pages_text: list, chunk_size=150) -> list:
    """Splits text into smaller chunks for precise semantic search."""
    chunks = []
    for page in pages_text:
        text = page["content"]
        words = text.split()
        # Create overlapping or simple chunks (simple chunks of ~150 words)
        for i in range(0, len(words), chunk_size):
            chunk_content = " ".join(words[i:i + chunk_size])
            chunks.append({
                "page_number": page["page_number"],
                "content": chunk_content
            })
    return chunks

def process_document(file_bytes: bytes) -> list:
    """Full pipeline: extract -> chunk -> embed"""
    pages_text = extract_text_from_pdf(file_bytes)
    chunks = chunk_text(pages_text, chunk_size=150)
    
    if not chunks:
        return []
    
    # Generate embeddings
    texts_to_embed = [chunk["content"] for chunk in chunks]
    embeddings = model.encode(texts_to_embed).tolist()
    
    # Attach embeddings to chunks
    for i, chunk in enumerate(chunks):
        chunk["embedding"] = embeddings[i]
        
    return chunks
