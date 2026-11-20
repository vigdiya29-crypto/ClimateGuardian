"""
ai_service.py
-------------
AI Environmental Intelligence Service.
Integrates with Google Gemini API when GEMINI_API_KEY is configured in Settings,
with a robust, deterministic climate reasoning engine fallback when offline or unconfigured.
Uses httpx for zero-dependency async HTTP queries.
"""

import httpx
import logging
from typing import Dict, Any, Optional
from app.config import get_settings

logger = logging.getLogger("climateguardian.ai")
settings = get_settings()


async def _call_gemini_api(prompt: str) -> Optional[str]:
    """
    Calls Google Gemini REST API if GEMINI_API_KEY is set.
    Returns generated text or None if error/unconfigured.
    """
    if not settings.GEMINI_API_KEY:
        return None

    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 300,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Gemini API call failed: {e}")

    return None


def _deterministic_insight(
    city: str,
    aqi: float,
    pollutant: str,
    temp_c: Optional[float] = None,
    humidity: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Synthesizes expert environmental insights based on live AQI and weather parameters.
    """
    if aqi <= 50:
        headline = f"Excellent Air Quality in {city}"
        text = (
            f"AQI is currently at {int(aqi)} (Good). Atmospheric dispersion is optimal. "
            "Conditions are ideal for all outdoor activities and physical workouts."
        )
        rec = "Open windows for natural ventilation and enjoy outdoor recreation."
        conf = 0.95
    elif aqi <= 100:
        headline = f"Satisfactory Conditions in {city}"
        text = (
            f"AQI is measured at {int(aqi)} (Satisfactory). {pollutant} levels remain within acceptable limits. "
            "Extremely sensitive individuals should monitor respiratory comfort."
        )
        rec = "Normal outdoor activities are favorable. Maintain routine indoor ventilation."
        conf = 0.93
    elif aqi <= 200:
        headline = f"Moderate AQI with Elevated {pollutant}"
        text = (
            f"AQI is predicted at {int(aqi)} (Moderate). {pollutant} is currently the primary contributor. "
            "Consider limiting strenuous outdoor exertion during peak traffic hours."
        )
        rec = "Keep windows closed during morning rush hour. Sensitive groups should wear light masks."
        conf = 0.91
    elif aqi <= 300:
        headline = f"Poor Air Quality Advisory for {city}"
        text = (
            f"AQI has spiked to {int(aqi)} (Poor). High concentration of {pollutant} poses breathing discomfort. "
            "Prolonged outdoor exposure is strongly discouraged."
        )
        rec = "Wear N95/N99 respirators outdoors. Run indoor HEPA filtration units."
        conf = 0.89
    elif aqi <= 400:
        headline = f"Very Poor Air Quality Alert in {city}"
        text = (
            f"AQI is critically high at {int(aqi)} (Very Poor). Heavy accumulation of {pollutant} detected. "
            "Respiratory illness risk is elevated for all citizens."
        )
        rec = "Avoid all non-essential outdoor travel. Keep air purifiers running continuously."
        conf = 0.88
    else:
        headline = f"Severe Health Emergency Warning for {city}"
        text = (
            f"AQI has surged to {int(aqi)} (Severe). Hazardous particulate saturation across {city}. "
            "Immediate protective health precautions are mandatory."
        )
        rec = "Strictly remain indoors with closed windows. Seek medical attention if experiencing respiratory distress."
        conf = 0.86

    return {
        "city": city,
        "aqi": round(aqi, 1),
        "primary_pollutant": pollutant,
        "headline": headline,
        "insight": text,
        "recommendation": rec,
        "confidence": conf,
        "engine": "ClimateGuardian Expert System",
    }


async def generate_ai_insight(
    city: str,
    aqi: float = 162.0,
    primary_pollutant: str = "PM2.5",
    temperature: Optional[float] = 25.0,
    humidity: Optional[float] = 60.0,
) -> Dict[str, Any]:
    """
    Generates structured AI insight for a given city and ambient condition.
    """
    # 1. Check if Gemini can enrich the insight
    if settings.GEMINI_API_KEY:
        prompt = (
            f"Act as an environmental scientist for ClimateGuardian. For city {city}, the current AQI is {aqi} "
            f"({primary_pollutant} is the dominant pollutant, temperature is {temperature}°C, humidity is {humidity}%). "
            f"Write a concise, 2-sentence actionable insight for citizens regarding outdoor activity and precautions."
        )
        gemini_text = await _call_gemini_api(prompt)
        if gemini_text:
            return {
                "city": city,
                "aqi": round(aqi, 1),
                "primary_pollutant": primary_pollutant,
                "headline": f"AI Environmental Snapshot for {city}",
                "insight": gemini_text,
                "recommendation": "Review local air quality advisories before prolonged outdoor exertion.",
                "confidence": 0.94,
                "engine": "Google Gemini 1.5",
            }

    # 2. Fallback to expert reasoning engine
    return _deterministic_insight(
        city=city,
        aqi=aqi,
        pollutant=primary_pollutant,
        temp_c=temperature,
        humidity=humidity,
    )


async def generate_chat_response(message: str, city: Optional[str] = "Delhi") -> Dict[str, Any]:
    """
    Answers user queries about air quality, emissions, green habits, or health advisories.
    """
    q = message.strip().lower()

    # 1. Check if Gemini is enabled
    if settings.GEMINI_API_KEY:
        prompt = (
            f"You are the ClimateGuardian AI Environmental Assistant. Answer this user question concisely and accurately:\n"
            f"User Question: {message}\n"
            f"Context: India ambient air quality, CPCB standards, carbon footprint reduction."
        )
        gemini_reply = await _call_gemini_api(prompt)
        if gemini_reply:
            return {
                "response": gemini_reply,
                "city": city,
                "source": "Google Gemini 1.5",
            }

    # 2. Expert system response matching common climate questions
    if any(k in q for k in ["mask", "n95", "respirator", "protect"]):
        reply = (
            "When AQI exceeds 200 (Poor), standard cloth masks are ineffective against fine PM2.5. "
            "Use certified N95 or N99 respirators fitted snugly over your nose and mouth to filter out ≥95% of fine particulate matter."
        )
    elif any(k in q for k in ["exercise", "run", "workout", "jog"]):
        reply = (
            "Avoid strenuous outdoor cardio workouts when AQI exceeds 150. High respiration rates draw particulates "
            "deep into the alveolar regions of the lungs. Shift workouts indoors or exercise during mid-afternoon when dispersion is highest."
        )
    elif any(k in q for k in ["purifier", "hepa", "filter", "indoor"]):
        reply = (
            "True HEPA filters capture 99.97% of particles down to 0.3 microns, including PM2.5 and allergen dust. "
            "Keep doors and windows sealed in the operational room, and replace filters every 6 to 12 months based on air quality index."
        )
    elif any(k in q for k in ["carbon", "footprint", "reduce", "tree"]):
        reply = (
            "The top individual drivers of household carbon footprints are electricity consumption (0.82 kg CO₂/kWh in India) "
            "and private vehicular transportation. Transitioning to LED appliances, public transit, and planting trees (absorbing ~21 kg CO₂/yr) helps offset emissions."
        )
    elif any(k in q for k in ["grap", "cpcb", "standard", "policy"]):
        reply = (
            "The Graded Response Action Plan (GRAP) by CAQM enforces 4 emergency stages in the Delhi-NCR region: "
            "Stage I (Poor, AQI 201-300), Stage II (Very Poor, AQI 301-400), Stage III (Severe, AQI 401-450), and Stage IV (Severe+, AQI >450)."
        )
    else:
        reply = (
            f"ClimateGuardian monitors live ambient parameters across {city or 'India'}. "
            "Key recommendations include checking daily AQI before commutes, keeping residential windows closed during morning temperature inversions, "
            "and reducing private vehicle usage to cut NOx and PM2.5 emissions."
        )

    return {
        "response": reply,
        "city": city,
        "source": "ClimateGuardian AI Assistant",
    }
