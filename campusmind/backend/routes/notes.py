import os
import uuid
import tempfile
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from services.pdf_service import process_pdf
from services.rag_service import store_embeddings, retrieve_context
from services.llm_service import ask_llm

router = APIRouter(prefix="/notes", tags=["Notes AI"])

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AskRequest(BaseModel):
    question: str
    file_id: str


class SummarizeRequest(BaseModel):
    file_id: str


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files allowed"}

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    chunks, file_id = process_pdf(file_path, file_id)
    count = store_embeddings(chunks, file_id)

    return {"message": "PDF processed", "file_id": file_id, "chunks": count}


@router.post("/ask")
def ask_question(req: AskRequest):
    context = retrieve_context(req.question, req.file_id)
    if not context:
        return {"answer": "No relevant context found in the uploaded PDF."}

    prompt = f"""You are a helpful BCA student assistant. Answer the question based on the provided context.

Context:
{context}

Question: {req.question}

Answer concisely and accurately based only on the context above. If the answer is not in the context, say so."""
    answer = ask_llm(prompt)
    return {"answer": answer}


@router.post("/summarize")
def summarize(req: SummarizeRequest):
    context = retrieve_context(
        "summarize the key topics and main points of this document", req.file_id, top_k=10
    )
    if not context:
        return {"summary": "No content found to summarize."}

    prompt = f"""Summarize the following academic content in a clear, concise manner suitable for BCA exam revision. Highlight key concepts, formulas, and important points.

Content:
{context}

Summary:"""
    summary = ask_llm(prompt)
    return {"summary": summary}
