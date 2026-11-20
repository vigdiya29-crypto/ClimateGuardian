"""
insights.py — /api/insights routes
----------------------------------
Endpoints:
  GET /api/insights/aqi-categories     — CPCB NAQI standard categories, ranges, and health advisories
  GET /api/insights/pollutants         — Regulated ambient air pollutants, definitions, and safe limits
  GET /api/insights/preventive-measures — Personal health protection action guidelines
  GET /api/insights/guidelines         — Government statutory frameworks (GRAP, NCAP, BS-VI)
  GET /api/insights                    — Comprehensive knowledge bundle
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.insights_service import (
    get_aqi_categories,
    get_pollutant_info,
    get_preventive_measures,
    get_government_guidelines,
    get_all_insights,
)

router = APIRouter(prefix="/api/insights", tags=["Insights & Standards"])


@router.get("", response_model=Dict[str, Any])
def read_all_insights():
    """
    Returns complete knowledge bundle including NAQI categories, pollutant specs,
    preventive health actions, and statutory frameworks.
    """
    return get_all_insights()


@router.get("/aqi-categories", response_model=List[Dict[str, Any]])
def read_aqi_categories():
    """
    Returns official CPCB National Air Quality Index (NAQI) categories and color codes.
    """
    return get_aqi_categories()


@router.get("/pollutants", response_model=List[Dict[str, Any]])
def read_pollutants():
    """
    Returns profiles and safe exposure thresholds for the 6 regulated ambient pollutants.
    """
    return get_pollutant_info()


@router.get("/preventive-measures", response_model=List[Dict[str, Any]])
def read_preventive_measures():
    """
    Returns personal health protection guidelines and respiratory advisory measures.
    """
    return get_preventive_measures()


@router.get("/guidelines", response_model=List[Dict[str, Any]])
def read_government_guidelines():
    """
    Returns statutory clean-air frameworks and emission standards.
    """
    return get_government_guidelines()
