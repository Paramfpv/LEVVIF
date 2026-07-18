import asyncio
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import auth, chat, guest, history, phenoage, upload


async def _keep_ml_service_alive():
    """Ping the ML service every 10 minutes so it never cold-starts."""
    await asyncio.sleep(10)  # small delay to let the app finish starting
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(f"{settings.ml_service_url}/")
        except Exception:
            pass
        await asyncio.sleep(600)  # 10 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(_keep_ml_service_alive())
    yield


app = FastAPI(title="LEWIF", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(guest.router, prefix="/guest", tags=["guest"])
app.include_router(phenoage.router, prefix="/phenoage", tags=["phenoage"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health():
    return {"status": "ok"}
