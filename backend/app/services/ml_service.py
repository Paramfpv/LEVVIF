import httpx
from app.config import settings


def predict_crp(
    age: float,
    female: int,
    bmi: float,
    ever_smoked: int,
    sleep_hours: float,
    trouble_sleeping: int,
    vigorous_work: int,
    vigorous_recreation: int,
    sedentary_minutes: float,
    ever_drinks: int,
) -> float:
    payload = {
        "age": age,
        "female": female,
        "bmi": bmi,
        "ever_smoked": ever_smoked,
        "sleep_hours": sleep_hours,
        "trouble_sleeping": trouble_sleeping,
        "vigorous_work": vigorous_work,
        "vigorous_recreation": vigorous_recreation,
        "sedentary_minutes": sedentary_minutes,
        "ever_drinks": ever_drinks,
    }
    response = httpx.post(
        f"{settings.ml_service_url}/predict/crp",
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["crp_mg_per_l"]
