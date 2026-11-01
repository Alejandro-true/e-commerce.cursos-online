from fastapi import FastAPI

from app.routers import achievements, health, moderation, reviews

from pathlib import Path
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Comunidad Service")

app.include_router(health.router)
app.include_router(reviews.router)
app.include_router(moderation.router)
app.include_router(achievements.router)

FRONTEND_DIR = Path(__file__).resolve().parents[1] / "frontend"

app.mount(
    "/panel",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="comunidad-panel",
)