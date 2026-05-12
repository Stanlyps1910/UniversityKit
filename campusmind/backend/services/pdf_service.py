import fitz
import uuid
import os

CHUNK_SIZE = 500
OVERLAP = 50


def process_pdf(file_path: str, file_id: str = None) -> list:
    if file_id is None:
        file_id = str(uuid.uuid4())

    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()

    words = full_text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunk = " ".join(words[start:end])
        chunks.append({
            "text": chunk,
            "chunk_index": len(chunks),
            "file_id": file_id,
        })
        start += CHUNK_SIZE - OVERLAP

    os.remove(file_path)
    return chunks, file_id
