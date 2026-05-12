from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import ask_llm
from services.rag_service import retrieve_context

router = APIRouter(prefix="/viva", tags=["Viva Generator"])


class VivaRequest(BaseModel):
    topic: str
    file_id: str = ""
    type: str = "viva"


@router.post("/generate")
def generate_questions(req: VivaRequest):
    context = ""
    if req.file_id:
        context = retrieve_context(req.topic, req.file_id, top_k=8)

    type_labels = {
        "viva": "viva questions and answers",
        "mcq": "multiple choice questions with answers",
        "short_answer": "short answer questions with answers",
    }
    qtype = type_labels.get(req.type, "viva questions and answers")

    prompt = f"""You are a college professor preparing {qtype} for BCA students on the topic: {req.topic}.

"""

    if context:
        prompt += f"""Use the following reference material to create the questions:
{context}

"""
    else:
        prompt += "Use your general knowledge to create the questions.\n\n"

    prompt += f"""Generate 5 {qtype}. For each question:
- Provide the question clearly
- Provide the correct answer

Format each as:
Q1: [question]
A1: [answer]

Q2: [question]
A2: [answer]"""

    result = ask_llm(prompt)
    questions = parse_qas(result)
    return {"questions": questions, "type": req.type}


def parse_qas(text: str) -> list:
    lines = text.strip().split("\n")
    questions = []
    current_q = ""
    current_a = ""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith("Q") and ":" in line[:5]:
            if current_q and current_a:
                questions.append({"question": current_q, "answer": current_a})
            current_q = line.split(":", 1)[1].strip()
            current_a = ""
        elif line.startswith("A") and ":" in line[:5]:
            current_a = line.split(":", 1)[1].strip()
        else:
            if current_a:
                current_a += " " + line
            else:
                current_q += " " + line if current_q else line
    if current_q and current_a:
        questions.append({"question": current_q, "answer": current_a})
    return questions
