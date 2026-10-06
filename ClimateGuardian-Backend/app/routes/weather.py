from fastapi import APIRouter, HTTPException
from app.services.aqi_service import get_current_weather, UpstreamAPIError

router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"]
)


@router.get("/current")
async def current_weather(city: str):
    """
    Returns current live weather data for a requested city from Open-Meteo.
    """
    try:
        return await get_current_weather(city)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except UpstreamAPIError as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
