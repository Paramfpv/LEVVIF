# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LEWIF — a longevity/healthspan tool that calculates biological age from blood biomarkers. Portfolio piece and potential startup demo. Python, managed with [uv](https://docs.astral.sh/uv/). Requires Python >= 3.14.

## v1 Scope

Calculate biological age from 9 biomarkers using the Levine 2018 PhenoAge formula, served via a FastAPI endpoint. No frontend. Auth and user management via Supabase. Lab report OCR via Gemini. Personalized chat via Gemini + Mem0.

### PhenoAge Implementation

Own implementation of the Levine 2018 formula (not using Biolearn — too heavy a dependency for ~15 lines of math). The formula expects SI units (g/L, umol/L, mmol/L); a `convert_us_to_si()` helper handles US lab unit conversion. The PhenoAge endpoint accepts US lab units and converts internally.

Coefficient validation status: coefficients cross-checked against multiple independent sources (omux.dev, MCP PhenoAge, original paper Table 1). Results are directionally correct and within ~1 year of reference implementations. Full validation against Levine 2018 Supplement 1 still pending.

### Lab Report Upload (OCR via Gemini)

Users can upload a PDF or image of a lab report. Gemini 2.5 Flash extracts the 9 biomarker values, which are then fed through the PhenoAge formula. Missing biomarkers are filled with NHANES population average defaults. Age is required (extracted from report or provided manually).

### Data Storage Split

- **Supabase** — Auth, structured data (exact biomarker numbers, PhenoAge scores, timestamps in `calculations` table)
- **Mem0** — Semantic memory for the LLM chatbot (health journey narrative, lifestyle info, user preferences)

### Chat (Gemini + Mem0)

POST /chat endpoint. Pulls recent calculations from Supabase + relevant memories from Mem0, feeds both as context to Gemini 2.5 Flash for personalized health recommendations. User messages are stored in Mem0 to build up health profile over time.

## Structure

```
app/
├── main.py              # FastAPI app, router registration
├── config.py             # Settings via pydantic-settings (.env)
├── routes/
│   ├── auth.py           # Auth endpoints (signup, login, logout, delete)
│   ├── chat.py           # POST /chat (LLM chatbot with memory)
│   ├── guest.py          # POST /guest/calculate (no auth, no history)
│   ├── history.py        # GET /history (past calculation results)
│   ├── phenoage.py       # POST /phenoage/calculate
│   └── upload.py         # POST /upload/lab-report (PDF/image → PhenoAge)
└── services/
    ├── gemini.py         # Gemini Flash: biomarker extraction + chat
    ├── mem0.py           # Mem0: add/search semantic memories
    ├── phenoage.py       # PhenoAge formula + unit converter
    └── supabase.py       # Supabase client (auth + database)
tests/
└── test_phenoage.py      # Formula validation against known sources
main.py                   # uvicorn entry point
```

## Commands

```bash
uv run python main.py                  # Start dev server (port 8000, auto-reload)
uv run python -m tests.test_phenoage   # Run PhenoAge validation tests
uv add <package>                       # Add a dependency
uv sync                                # Install/sync dependencies
```

## Workflow

Small, reviewed iterations. Propose a plan before writing code and wait for confirmation. Do not write code during brainstorming — only when explicitly told.
