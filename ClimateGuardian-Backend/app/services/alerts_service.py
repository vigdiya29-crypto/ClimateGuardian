"""
alerts_service.py
-----------------
Service managing environmental notifications, live AQI threshold alerts,
meteorological advisories, and environmental news broadcasts.
"""

from typing import List, Dict, Any, Optional

# Active monitoring advisory broadcasts across key zones
_DEFAULT_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "a1",
        "type": "aqi",
        "severity": "poor",
        "city": "Delhi",
        "message": "AQI crossed 300 in Anand Vihar zone. Elevated PM2.5 levels detected.",
        "time": "2h ago",
    },
    {
        "id": "a2",
        "type": "weather",
        "severity": "moderate",
        "city": "Jammu",
        "message": "Heavy rain and localized thunder expected this evening.",
        "time": "4h ago",
    },
    {
        "id": "a3",
        "type": "aqi",
        "severity": "moderate",
        "city": "Mumbai",
        "message": "PM10 particulate levels rising near Chembur and industrial corridors.",
        "time": "6h ago",
    },
    {
        "id": "a4",
        "type": "aqi",
        "severity": "good",
        "city": "Bengaluru",
        "message": "Air quality improved to Satisfactory following afternoon showers.",
        "time": "8h ago",
    },
    {
        "id": "a5",
        "type": "weather",
        "severity": "moderate",
        "city": "Kolkata",
        "message": "High humidity and reduced surface wind dispersion across South Kolkata.",
        "time": "10h ago",
    },
    {
        "id": "a6",
        "type": "aqi",
        "severity": "poor",
        "city": "Patna",
        "message": "Severe particulate accumulation reported along riverbank monitoring stations.",
        "time": "12h ago",
    },
]

_DEFAULT_NEWS: List[Dict[str, Any]] = [
    {
        "id": "n1",
        "title": "CPCB launches revised AQI advisory for monsoon season",
        "source": "PIB",
        "time": "3h ago",
    },
    {
        "id": "n2",
        "title": "Delhi NCR to pilot low-emission zones from August",
        "source": "Down To Earth",
        "time": "5h ago",
    },
    {
        "id": "n3",
        "title": "New study links PM2.5 exposure to reduced crop yield",
        "source": "The Hindu",
        "time": "1d ago",
    },
    {
        "id": "n4",
        "title": "National Clean Air Programme (NCAP) expands real-time sensor grid to 40 Tier-2 cities",
        "source": "MoEFCC",
        "time": "2d ago",
    },
]


def get_alerts(
    city: Optional[str] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Returns alerts filtered by city, type ('aqi' or 'weather'), or severity.
    Passing 'All' or None disables that filter.
    """
    results = _DEFAULT_ALERTS

    if city and city.strip().lower() != "all":
        c_clean = city.strip().lower()
        results = [a for a in results if a["city"].strip().lower() == c_clean]

    if alert_type and alert_type.strip().lower() != "all":
        t_clean = alert_type.strip().lower()
        results = [a for a in results if a["type"].strip().lower() == t_clean]

    if severity and severity.strip().lower() != "all":
        s_clean = severity.strip().lower()
        results = [a for a in results if a["severity"].strip().lower() == s_clean]

    return results


def get_news() -> List[Dict[str, Any]]:
    """
    Returns latest environmental news items.
    """
    return _DEFAULT_NEWS
