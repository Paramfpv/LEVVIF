from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.gemini import chat
from app.services.mem0 import add_memory, search_memory
from app.services.supabase import get_supabase

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    access_token: str
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    sb = get_supabase()
    try:
        user = sb.auth.get_user(req.access_token)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    user_id = user.user.id

    recent = (
        sb.table("calculations")
        .select("phenoage,chronological_age,age_difference,biomarkers,defaulted_biomarkers,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    memories = search_memory(user_id, req.message)

    context_parts = []

    if recent.data:
        context_parts.append("Recent PhenoAge results (newest first):")
        for r in recent.data:
            context_parts.append(
                f"  - Date: {r['created_at']}, PhenoAge: {r['phenoage']}, "
                f"Age: {r['chronological_age']}, Difference: {r['age_difference']}, "
                f"Defaults used: {r['defaulted_biomarkers']}"
            )
    else:
        context_parts.append("No PhenoAge calculations yet.")

    if memories:
        context_parts.append("\nWhat we know about this user:")
        for m in memories:
            context_parts.append(f"  - {m}")

    health_context = "\n".join(context_parts)

    reply = chat(
        req.message,
        health_context,
        [{"role": m.role, "content": m.content} for m in req.history],
    )

    add_memory(user_id, f"User said: {req.message}")

    return ChatResponse(reply=reply)
