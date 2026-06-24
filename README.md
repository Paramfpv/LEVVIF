# LEWIF — Know Your Biological Age

LEWIF calculates your **biological age** from standard blood biomarkers using the clinically validated [Levine PhenoAge formula](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/). Upload a lab report, get your biological age in seconds, and chat with a personalized AI health advisor.

**Live demo:** [levvif.vercel.app](https://levvif.vercel.app)

---

## What It Does

- **Upload a lab report** (PDF or photo) — AI extracts 9 blood biomarkers automatically
- **Get your PhenoAge** — biological age calculated using the Levine 2018 formula
- **AI health advisor** — a chatbot that knows your health data and gives personalized, evidence-based recommendations
- **Track over time** — every result is saved so you can see how your biological age changes
- **Guest mode** — try it without creating an account

## How It Works

```
Upload lab report (PDF/image)
        ↓
Gemini 2.5 Flash extracts 9 biomarkers via OCR
        ↓
PhenoAge formula calculates biological age
        ↓
Results stored in Supabase (structured data)
        ↓
Mem0 builds semantic memory of your health journey
        ↓
Groq (Llama 3.3 70B) powers the AI health advisor
```

## The Science

PhenoAge uses 9 standard blood biomarkers — albumin, creatinine, glucose, C-reactive protein, lymphocyte %, mean cell volume, red cell distribution width, alkaline phosphatase, and white blood cell count — to calculate a composite biological age that correlates with mortality risk better than chronological age alone.

Two people who are both 40 on paper can have very different biological ages. PhenoAge captures that difference.

If a biomarker is missing from the report, LEWIF uses NHANES population averages as defaults and clearly labels which values were assumed.

## Tech Stack

### Backend
- **FastAPI** — REST API
- **Supabase** — Authentication + PostgreSQL database
- **Gemini 2.5 Flash** — Lab report OCR (biomarker extraction from PDFs/images)
- **Groq + Llama 3.3 70B** — AI chatbot
- **Mem0** — Semantic memory layer for personalized conversations
- **Python 3.14** / **uv** package manager

### Frontend
- **Next.js 16** — React framework
- **Tailwind CSS** — Styling
- **shadcn/ui** — UI components
- **TypeScript**

### Infrastructure
- **Render** — Backend hosting
- **Vercel** — Frontend hosting

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Environment settings
│   │   ├── routes/
│   │   │   ├── auth.py          # Signup, login, logout, delete account
│   │   │   ├── chat.py          # AI chatbot with persistent history
│   │   │   ├── guest.py         # Guest calculator + one-shot analysis
│   │   │   ├── history.py       # Past calculation results
│   │   │   ├── phenoage.py      # PhenoAge calculation endpoint
│   │   │   └── upload.py        # Lab report upload + OCR
│   │   └── services/
│   │       ├── gemini.py        # Gemini OCR + Groq chat
│   │       ├── mem0.py          # Semantic memory
│   │       ├── phenoage.py      # PhenoAge formula implementation
│   │       └── supabase.py      # Database client
│   ├── tests/
│   │   └── test_phenoage.py     # Formula validation
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # UI components
│   │   └── lib/                 # API client, auth context
│   └── package.json
```

## Local Development

### Prerequisites
- Python 3.14+
- Node.js 20+
- Supabase project (free tier)
- API keys: Gemini, Groq, Mem0

### Backend
```bash
cd backend
cp .env.example .env  # Add your API keys
uv sync
uv run python main.py  # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### Environment Variables

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
MEM0_API_KEY=your-mem0-key
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| POST | `/guest/calculate` | No | Manual biomarker input |
| POST | `/guest/analyze` | No | One-shot AI analysis |
| POST | `/upload/lab-report` | Optional | Upload report + calculate PhenoAge |
| GET | `/history/` | Yes | Past calculation results |
| POST | `/chat/` | Yes | AI health advisor |
| GET | `/chat/history` | Yes | Chat message history |

## References

- Levine, M.E. et al. (2018). "An epigenetic biomarker of aging for lifespan and healthspan." *Aging*, 10(4), 573-591. [PMC5940111](https://pmc.ncbi.nlm.nih.gov/articles/PMC5940111/)
- NHANES (National Health and Nutrition Examination Survey) — population reference data for biomarker defaults
