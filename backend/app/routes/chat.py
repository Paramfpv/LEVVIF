from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.gemini import chat
from app.services.mem0 import add_memory, search_memory
from app.services.supabase import get_supabase

router = APIRouter()

MAX_HISTORY_FOR_LLM = 20


class ChatRequest(BaseModel):
    access_token: str
    message: str


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: str


class ChatResponse(BaseModel):
    reply: str


def _get_user_id(access_token: str) -> str:
    sb = get_supabase()
    try:
        user = sb.auth.get_user(access_token)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/history", response_model=list[ChatMessageOut])
def get_chat_history(access_token: str):
    user_id = _get_user_id(access_token)
    sb = get_supabase()

    result = (
        sb.table("chat_messages")
        .select("role,content,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )

    return result.data


@router.post("/", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_id = _get_user_id(req.access_token)
    sb = get_supabase()

    recent_messages = (
        sb.table("chat_messages")
        .select("role,content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(MAX_HISTORY_FOR_LLM)
        .execute()
    )
    chat_history = list(reversed(recent_messages.data))

    recent_calcs = (
        sb.table("calculations")
        .select("phenoage,chronological_age,age_difference,biomarkers,defaulted_biomarkers,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )

    memories = []
    try:
        memories = search_memory(user_id, req.message)
    except Exception:
        pass

    context_parts = []

    if recent_calcs.data:
        context_parts.append("PhenoAge results (newest first):")
        for r in recent_calcs.data:
            context_parts.append(
                f"  - Date: {r['created_at']}, PhenoAge: {r['phenoage']}, "
                f"Age: {r['chronological_age']}, Difference: {r['age_difference']}, "
                f"Defaults used: {r['defaulted_biomarkers']}"
            )
    else:
        context_parts.append("No PhenoAge calculations yet.")

    if memories:
        context_parts.append("\nKnown about this user:")
        for m in memories:
            context_parts.append(f"  - {m}")

    health_context = "\n".join(context_parts)

    try:
        reply = chat(req.message, health_context, chat_history)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chat failed: {e}")

    sb.table("chat_messages").insert(
        {"user_id": user_id, "role": "user", "content": req.message}
    ).execute()

    sb.table("chat_messages").insert(
        {"user_id": user_id, "role": "assistant", "content": reply}
    ).execute()

    try:
        add_memory(user_id, f"User said: {req.message}")
    except Exception:
        pass

    return ChatResponse(reply=reply)
