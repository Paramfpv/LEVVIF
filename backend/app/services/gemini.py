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

CHAT_SYSTEM_PROMPT = """You are LEWIF, a personal health companion focused on longevity and biological age.

Personality:
- Conversational and natural — like a knowledgeable friend, not a doctor or a blog post.
- Match the user's energy. Short question = short answer. Deep question = detailed answer.
- Have a warm but real personality. You can use humor when appropriate.
- You can chat casually, but your expertise is health and longevity.

Rules:
- NEVER open with or repeat the user's PhenoAge score unless they specifically ask about it or it's their very first interaction.
- Reference their health data ONLY when it's directly relevant to what they asked.
- Don't repeat information you've already shared earlier in this conversation.
- If you've already welcomed or introduced yourself, don't do it again.
- When the user shares personal info (name, lifestyle, habits), acknowledge it naturally without pivoting to a health lecture.
- If something needs a doctor, say so briefly — one line, not a paragraph of disclaimers.
- Keep responses concise. No bullet-point lists unless the user asks for specific recommendations.
- Don't start messages with "That's great!" or "Fantastic!" every time. Vary your tone.

The user's health data is provided below as background context. It's there for you to reference when relevant — not to dump on the user unprompted."""


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


def chat(
    user_message: str,
    health_context: str,
    chat_history: list[dict] | None = None,
) -> str:
    client = genai.Client(api_key=settings.gemini_api_key)

    system = f"""{CHAT_SYSTEM_PROMPT}

User's health background:
{health_context}"""

    contents = []

    if chat_history:
        for msg in chat_history:
            contents.append(
                genai.types.Content(
                    role="user" if msg["role"] == "user" else "model",
                    parts=[genai.types.Part.from_text(text=msg["content"])],
                )
            )

    contents.append(
        genai.types.Content(
            role="user",
            parts=[genai.types.Part.from_text(text=user_message)],
        )
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=genai.types.GenerateContentConfig(
            system_instruction=system,
        ),
    )

    return response.text
