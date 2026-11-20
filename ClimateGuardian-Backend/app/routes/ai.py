"""
ai.py — /api/ai routes
----------------------
Endpoints:
  GET  /api/ai/insight — Context-aware AI atmospheric summary and health advisory
  POST /api/ai/chat    — Interactive environmental assistant for citizen queries
"""

from fastapi import APIRouter, Query, Request
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.ai_service import generate_ai_insight, generate_chat_response

router = APIRouter(prefix="/api/ai", tags=["AI & Gemini Services"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    city: Optional[str] = Field("Delhi", max_length=50)


@router.get("/insight", response_model=Dict[str, Any])
async def get_insight(
    request: Request,
    city: str = Query("Delhi", description="Target city for environmental insight"),
    aqi: Optional[float] = Query(None, description="Optional predicted AQI override"),
    pollutant: Optional[str] = Query("PM2.5", description="Primary dominant pollutant"),
):
    """
    Returns AI-generated atmospheric health overview and advisory for a city.
    Directly powers the Dashboard AI Insight Card.
    """
    aqi_val = aqi or 162.0
    return await generate_ai_insight(
        city=city,
        aqi=aqi_val,
        primary_pollutant=pollutant or "PM2.5",
    )


@router.post("/chat", response_model=Dict[str, Any])
async def chat_with_assistant(req: ChatMessageRequest):
    """
    Answers user queries about air quality standards, health precautions, and sustainability actions.
    """
    return await generate_chat_response(message=req.message, city=req.city)
