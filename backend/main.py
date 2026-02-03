from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db

# Import routers
from routers import conversations as conv_router
from routers import messages as msg_router
from routers import search as search_router
from routers import audio as audio_router
from routers import translate as translate_router
from routers import summarize as summarize_router
from websocket.handlers import websocket_router

app = FastAPI(
    title="MedTranslate API",
    description="Real-time AI-powered healthcare translation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conv_router.router)
app.include_router(msg_router.router)
app.include_router(search_router.router)
app.include_router(audio_router.router)
app.include_router(translate_router.router)
app.include_router(summarize_router.router)
app.include_router(websocket_router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

