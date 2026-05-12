import chromadb
import uuid
from sentence_transformers import SentenceTransformer

CHROMA_DIR = "./chroma_db"
embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path=CHROMA_DIR)


def store_embeddings(chunks: list, file_id: str):
    collection_name = file_id.replace("-", "_")
    try:
        collection = client.get_collection(name=collection_name)
    except Exception:
        collection = client.create_collection(name=collection_name)

    ids = [str(uuid.uuid4()) for _ in chunks]
    texts = [c["text"] for c in chunks]
    embeddings = embedder.encode(texts, show_progress_bar=False).tolist()

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=[{"file_id": file_id, "chunk_index": c["chunk_index"]} for c in chunks],
    )
    return len(chunks)


def retrieve_context(question: str, file_id: str, top_k: int = 5) -> str:
    collection_name = file_id.replace("-", "_")
    try:
        collection = client.get_collection(name=collection_name)
    except Exception:
        return ""

    q_embedding = embedder.encode([question], show_progress_bar=False).tolist()
    results = collection.query(query_embeddings=q_embedding, n_results=top_k)
    docs = results.get("documents", [[]])[0]
    return "\n\n".join(docs)
