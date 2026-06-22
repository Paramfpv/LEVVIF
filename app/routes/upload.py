from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.gemini import extract_biomarkers
from app.services.mem0 import add_memory
from app.services.phenoage import calculate_phenoage, convert_us_to_si
from app.services.supabase import get_supabase

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}

POPULATION_DEFAULTS = {
    "albumin": 4.25,
    "creatinine": 0.9,
    "glucose": 95.0,
    "crp": 2.0,
    "lymphocyte_percent": 30.0,
    "mcv": 90.0,
    "rdw": 13.2,
    "alkaline_phosphatase": 70.0,
    "wbc": 6.5,
}


class UploadResponse(BaseModel):
    phenoage: float
    chronological_age: float
    age_difference: float
    extracted_biomarkers: dict
    defaulted_biomarkers: list[str]


@router.post("/lab-report", response_model=UploadResponse)
async def upload_lab_report(
    file: Annotated[UploadFile, File(description="Lab report PDF or image")],
    age: Annotated[float | None, Form(description="Patient age in years (required if not found in report)")] = None,
    access_token: Annotated[str | None, Form(description="Auth token (optional — enables saving history)")] = None,
):
    """Upload a lab report to calculate PhenoAge.

    Accepts PDF (multi-page supported) or a single image (PNG, JPEG, WebP).
    Age is extracted from the report if found, otherwise provide it manually.
    Missing biomarkers are filled with population average defaults (NHANES).
    Pass access_token to save results to your history.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use PDF, PNG, JPEG, or WebP.",
        )

    file_bytes = await file.read()

    try:
        biomarkers = extract_biomarkers([(file_bytes, file.content_type)])
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract biomarkers: {e}")

    if age is not None:
        biomarkers["age"] = age

    if not biomarkers.get("age"):
        raise HTTPException(
            status_code=422,
            detail="Age not found in the report. Please provide it manually using the age field.",
        )

    defaulted = []
    for key, default_value in POPULATION_DEFAULTS.items():
        if biomarkers.get(key) is None:
            biomarkers[key] = default_value
            defaulted.append(key)

    alb, cre, glu, crp = convert_us_to_si(
        biomarkers["albumin"],
        biomarkers["creatinine"],
        biomarkers["glucose"],
        biomarkers["crp"],
    )

    phenoage = calculate_phenoage(
        albumin=alb,
        creatinine=cre,
        glucose=glu,
        crp=crp,
        lymphocyte_percent=biomarkers["lymphocyte_percent"],
        mcv=biomarkers["mcv"],
        rdw=biomarkers["rdw"],
        alkaline_phosphatase=biomarkers["alkaline_phosphatase"],
        wbc=biomarkers["wbc"],
        age=biomarkers["age"],
    )

    result = UploadResponse(
        phenoage=round(phenoage, 2),
        chronological_age=biomarkers["age"],
        age_difference=round(phenoage - biomarkers["age"], 2),
        extracted_biomarkers=biomarkers,
        defaulted_biomarkers=defaulted,
    )

    if access_token:
        try:
            sb = get_supabase()
            user = sb.auth.get_user(access_token)
            user_id = user.user.id

            sb.table("calculations").insert({
                "user_id": user_id,
                "biomarkers": biomarkers,
                "phenoage": result.phenoage,
                "chronological_age": result.chronological_age,
                "age_difference": result.age_difference,
                "defaulted_biomarkers": defaulted,
            }).execute()

            memory_text = (
                f"PhenoAge result: {result.phenoage} "
                f"(chronological age {result.chronological_age}, "
                f"{'younger' if result.age_difference < 0 else 'older'} "
                f"by {abs(result.age_difference)} years). "
            )
            if defaulted:
                memory_text += f"Missing from report: {', '.join(defaulted)}. "

            add_memory(user_id, memory_text)
        except Exception:
            pass

    return result
