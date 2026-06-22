from fastapi import FastAPI

from app.routes import auth, chat, guest, history, phenoage, upload

app = FastAPI(title="LEWIF", version="0.1.0")

app.include_router(guest.router, prefix="/guest", tags=["guest"])
app.include_router(phenoage.router, prefix="/phenoage", tags=["phenoage"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health():
    return {"status": "ok"}
