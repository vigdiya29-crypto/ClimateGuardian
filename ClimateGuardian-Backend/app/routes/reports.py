"""
reports.py — /api/reports routes
--------------------------------
Endpoints:
  GET /api/reports/metrics            — XGBoost model accuracy & benchmark metrics
  GET /api/reports/validation         — 14-day holdout validation series (actual vs predicted)
  GET /api/reports/feature-importance — feature importance ranking by gain
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.reports_service import (
    get_model_evaluation_metrics,
    get_validation_data,
    get_feature_importance_data,
)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/metrics", response_model=Dict[str, Any])
def get_metrics():
    """
    Returns XGBoost model evaluation benchmarks:
    r2, mae, rmse, mape, cvScore, confidence.
    """
    return get_model_evaluation_metrics()


@router.get("/validation", response_model=List[Dict[str, Any]])
def get_validation():
    """
    Returns 14-day holdout validation time series with actual and predicted AQI values.
    """
    return get_validation_data()


@router.get("/feature-importance", response_model=List[Dict[str, Any]])
def get_feature_importance():
    """
    Returns feature importance rankings by tree gain contribution.
    """
    return get_feature_importance_data()
