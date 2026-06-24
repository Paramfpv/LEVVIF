from fastapi import APIRouter, HTTPException
from groq import Groq
from pydantic import BaseModel

from app.config import settings
from app.services.phenoage import calculate_phenoage, convert_us_to_si

GUEST_ANALYSIS_PROMPT = """You are a friendly health advisor. The user just uploaded their blood test and got their biological age calculated. Give them a brief, personalized analysis in 2-3 short paragraphs.

Be conversational, not clinical. Mention their specific numbers naturally. If they're biologically younger, celebrate it. If older, be encouraging about what they can do. If some biomarkers were defaulted (population averages used), mention that getting those tested next time would give a more complete picture.

Don't use bullet points. Don't be generic. Make it feel like a real person looked at their results."""

router = APIRouter()


class GuestPhenoAgeRequest(BaseModel):
    albumin: float
    creatinine: float
    glucose: float
    crp: float
    lymphocyte_percent: float
    mcv: float
    rdw: float
    alkaline_phosphatase: float
    wbc: float
    age: float


class GuestPhenoAgeResponse(BaseModel):
    phenoage: float
    chronological_age: float
    age_difference: float


@router.post("/calculate", response_model=GuestPhenoAgeResponse)
def guest_calculate(req: GuestPhenoAgeRequest):
    """Calculate PhenoAge without authentication. No history saved.
    Inputs in US lab units (g/dL, mg/dL, mg/dL, mg/L)."""
    alb, cre, glu, crp = convert_us_to_si(
        req.albumin, req.creatinine, req.glucose, req.crp,
    )
    phenoage = calculate_phenoage(
        albumin=alb,
        creatinine=cre,
        glucose=glu,
        crp=crp,
        lymphocyte_percent=req.lymphocyte_percent,
        mcv=req.mcv,
        rdw=req.rdw,
        alkaline_phosphatase=req.alkaline_phosphatase,
        wbc=req.wbc,
        age=req.age,
    )
    return GuestPhenoAgeResponse(
        phenoage=round(phenoage, 2),
        chronological_age=req.age,
        age_difference=round(phenoage - req.age, 2),
    )


class AnalyzeRequest(BaseModel):
    phenoage: float
    chronological_age: float
    age_difference: float
    extracted_biomarkers: dict
    defaulted_biomarkers: list[str]


class AnalyzeResponse(BaseModel):
    analysis: str


@router.post("/analyze", response_model=AnalyzeResponse)
def guest_analyze(req: AnalyzeRequest):
    context = (
        f"PhenoAge: {req.phenoage}, Chronological age: {req.chronological_age}, "
        f"Difference: {req.age_difference} years "
        f"({'younger' if req.age_difference < 0 else 'older'} biologically). "
        f"Biomarkers: {req.extracted_biomarkers}. "
    )
    if req.defaulted_biomarkers:
        context += f"These were not in the report and used population averages: {', '.join(req.defaulted_biomarkers)}."

    try:
        client = Groq(api_key=settings.groq_api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": GUEST_ANALYSIS_PROMPT},
                {"role": "user", "content": context},
            ],
        )
        return AnalyzeResponse(analysis=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis failed: {e}")
