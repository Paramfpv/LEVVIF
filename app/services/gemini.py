import json

from google import genai

from app.config import settings

EXTRACTION_PROMPT = """Extract the following blood biomarker values and patient age from this lab report.
Return ONLY a JSON object with these exact keys, using the numeric values as they appear in the report:

{
  "albumin": <number in g/dL>,
  "creatinine": <number in mg/dL>,
  "glucose": <number in mg/dL>,
  "crp": <number in mg/L>,
  "lymphocyte_percent": <number as %>,
  "mcv": <number in fL>,
  "rdw": <number as %>,
  "alkaline_phosphatase": <number in U/L>,
  "wbc": <number in 1000 cells/uL>,
  "age": <number in years>
}

Look for the patient's age, date of birth, or DOB on the report. If you find a date of birth, calculate the age from it.
If a value is not found in the report, set it to null.
Return ONLY valid JSON, no markdown, no explanation."""

CHAT_SYSTEM_PROMPT = """You are a longevity and healthspan advisor for the LEWIF app. You help users understand their biological age (PhenoAge) results and give actionable, evidence-based recommendations.

Guidelines:
- Be warm, encouraging, and clear. Avoid medical jargon unless the user asks for detail.
- When referencing the user's data, cite specific numbers and trends.
- If something is outside your expertise (diagnosis, medication), say so and suggest consulting a doctor.
- Keep responses concise — 2-3 paragraphs max unless the user asks for more detail.
- When the user shares lifestyle info (exercise, diet, sleep, supplements), acknowledge it and relate it to their biomarkers where possible."""


def extract_biomarkers(files: list[tuple[bytes, str]]) -> dict:
    client = genai.Client(api_key=settings.gemini_api_key)

    parts = []
    for file_bytes, mime_type in files:
        parts.append(genai.types.Part.from_bytes(data=file_bytes, mime_type=mime_type))
    parts.append(EXTRACTION_PROMPT)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=parts,
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(text)


def chat(user_message: str, health_context: str) -> str:
    client = genai.Client(api_key=settings.gemini_api_key)

    prompt = f"""{CHAT_SYSTEM_PROMPT}

Here is the user's health context:
{health_context}

User: {user_message}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text
