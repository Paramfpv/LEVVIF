from fastapi import APIRouter
from pydantic import BaseModel

from app.services.phenoage import calculate_phenoage, convert_us_to_si

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
