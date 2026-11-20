"""
alerts.py — /api/alerts & /api/news routes
------------------------------------------
Endpoints:
  GET /api/alerts            — Environmental & AQI threshold alerts (filterable by city, type, severity)
  GET /api/news/environment  — Environmental policy and monitoring news items
"""

from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.services.alerts_service import get_alerts, get_news

router = APIRouter(tags=["Alerts & Broadcasts"])


@router.get("/api/alerts", response_model=List[Dict[str, Any]])
def read_alerts(
    city: Optional[str] = Query(None, description="City name to filter alerts (or 'All')"),
    type: Optional[str] = Query(None, description="Alert type filter: 'aqi', 'weather', or 'All'"),
    severity: Optional[str] = Query(None, description="Severity filter: 'poor', 'moderate', 'good', or 'All'"),
):
    """
    Returns environmental alerts filtered by optional city, type, and severity criteria.
    """
    return get_alerts(city=city, alert_type=type, severity=severity)


@router.get("/api/news/environment", response_model=List[Dict[str, Any]])
def read_environmental_news():
    """
    Returns latest national and regional environmental news items.
    """
    return get_news()
