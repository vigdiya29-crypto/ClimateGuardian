"""
reports_service.py
------------------
Service providing model evaluation benchmarks, holdout validation time-series,
and feature importance rankings for the Reports & Analytics view.
"""

from typing import Dict, Any, List


def get_model_evaluation_metrics() -> Dict[str, Any]:
    """
    Returns XGBoost model evaluation benchmarks matching the frontend contract
    defined in src/data/placeholderData.js (modelMetrics) and Reports.jsx.
    """
    return {
        "r2": 0.94,
        "mae": 8.2,
        "rmse": 12.6,
        "mape": 6.4,
        "cvScore": 0.91,
        "confidence": 0.89,
        "model_type": "XGBRegressor",
        "n_features": 22,
        "evaluation_split": "80/20 train/test with 5-fold cross validation"
    }


def get_validation_data() -> List[Dict[str, Any]]:
    """
    Returns 14-day holdout validation dataset for Actual vs Predicted visualization.
    Matches VALIDATION_DATA in ReportCharts.jsx.
    """
    return [
        {"day": "Day 1", "actual": 152, "predicted": 150},
        {"day": "Day 2", "actual": 168, "predicted": 164},
        {"day": "Day 3", "actual": 175, "predicted": 171},
        {"day": "Day 4", "actual": 142, "predicted": 146},
        {"day": "Day 5", "actual": 180, "predicted": 176},
        {"day": "Day 6", "actual": 165, "predicted": 162},
        {"day": "Day 7", "actual": 158, "predicted": 160},
        {"day": "Day 8", "actual": 172, "predicted": 169},
        {"day": "Day 9", "actual": 185, "predicted": 181},
        {"day": "Day 10", "actual": 160, "predicted": 158},
        {"day": "Day 11", "actual": 168, "predicted": 165},
        {"day": "Day 12", "actual": 174, "predicted": 170},
        {"day": "Day 13", "actual": 155, "predicted": 157},
        {"day": "Day 14", "actual": 168, "predicted": 166},
    ]


def get_feature_importance_data() -> List[Dict[str, Any]]:
    """
    Returns feature importance rankings for the model.
    Matches FEATURE_IMPORTANCE in ReportCharts.jsx.
    """
    return [
        {"name": "PM2.5 Concentration", "gain": 38.0, "category": "Particulate"},
        {"name": "PM10 Particulate", "gain": 24.0, "category": "Particulate"},
        {"name": "Wind Speed & Dispersion", "gain": 15.0, "category": "Meteorology"},
        {"name": "Relative Humidity", "gain": 11.0, "category": "Meteorology"},
        {"name": "Ambient Temperature", "gain": 7.0, "category": "Meteorology"},
        {"name": "NO₂ Vehicle Emissions", "gain": 5.0, "category": "Combustion"},
    ]
