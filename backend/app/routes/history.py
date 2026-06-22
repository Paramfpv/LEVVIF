from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.supabase import get_supabase

router = APIRouter()


class CalculationRecord(BaseModel):
    id: str
    biomarkers: dict
    phenoage: float
    chronological_age: float
    age_difference: float
    defaulted_biomarkers: list[str]
    created_at: str


@router.get("/", response_model=list[CalculationRecord])
def get_history(access_token: str):
    sb = get_supabase()
    try:
        user = sb.auth.get_user(access_token)
        if not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    result = (
        sb.table("calculations")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data
