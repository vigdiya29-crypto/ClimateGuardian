from fastapi import APIRouter, HTTPException, Request
from app.services.aqi_service import predict_aqi, UpstreamAPIError

router = APIRouter(
    prefix="/api/aqi",
    tags=["AQI"]
)


@router.get("/predict")
async def predict(city: str, request: Request):
    try:
        model = getattr(request.app.state, "model", None)
        return await predict_aqi(city, model=model)
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