import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import achievements, health, moderation, reviews
from app.core.config import settings
from app.services.module_completed_consumer import consume_module_completed


@asynccontextmanager
async def lifespan(_: FastAPI):
    consumer = asyncio.create_task(consume_module_completed())
    try:
        yield
    finally:
        consumer.cancel()
        try:
            await consumer
        except asyncio.CancelledError:
            pass

app = FastAPI(title="Comunidad Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_allowed_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Student-Id", "X-Admin-Id"],
)

app.include_router(health.router)
app.include_router(reviews.router)
app.include_router(moderation.router)
app.include_router(achievements.router)
