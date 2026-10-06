import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib

from app.config import get_settings
from app.services.coordinates_service import load_city_coordinates
from app.routes.aqi import router as aqi_router
from app.routes.weather import router as weather_router

logger = logging.getLogger("climateguardian")
logging.basicConfig(level=logging.INFO)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager:
    1. Loads city coordinates into in-memory dictionary once at startup.
    2. Loads the canonical 22-feature XGBoost model once into app.state.
    3. Cleans up resources upon shutdown.
    """
    logger.info("Initializing ClimateGuardian Backend lifespan...")

    # 1. Load city coordinates into memory
    coords = load_city_coordinates(settings.CITY_COORDINATES_PATH)
    app.state.coordinates = coords
    logger.info(f"Loaded {len(coords)} city coordinates into app.state.coordinates.")

    # 2. Load the canonical 22-feature XGBoost model ONCE
    if os.path.exists(settings.MODEL_PATH):
        try:
            model = joblib.load(settings.MODEL_PATH)
            app.state.model = model
            logger.info(f"XGBoost model loaded successfully into app.state.model from '{settings.MODEL_PATH}'.")
        except Exception as e:
            logger.error(f"Failed to load XGBoost model from '{settings.MODEL_PATH}': {e}")
            app.state.model = None
    else:
        logger.warning(f"XGBoost model not found at path '{settings.MODEL_PATH}'.")
        app.state.model = None

    yield

    logger.info("Shutting down ClimateGuardian Backend...")
    app.state.model = None
    app.state.coordinates = None


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS with allowed origins from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(aqi_router)
app.include_router(weather_router)


@app.get("/")
def root():
    return {
        "message": "ClimateGuardian Backend is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "ClimateGuardian API"
    }