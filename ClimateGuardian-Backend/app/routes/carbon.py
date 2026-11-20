"""
carbon.py — /api/carbon routes
--------------------------------
Endpoints:
  POST /api/carbon/calculate  — compute monthly carbon footprint
  GET  /api/carbon/factors    — return emission factors used by the model
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.carbon_service import (
    calculate_carbon_footprint,
    _VEHICLE_FACTORS,
    _RENEWABLE_MULTIPLIERS,
    _BUILDING_MULTIPLIERS,
    _FOOD_FACTORS,
    _ELECTRICITY_FACTOR,
    _LPG_FACTOR,
    _TREE_OFFSET_KG_PER_YEAR,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/carbon",
    tags=["Carbon"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class CarbonRequest(BaseModel):
    """
    Monthly lifestyle inputs for the GHG Protocol carbon footprint model.
    All ranges match the frontend form constraints in Carbon.jsx.
    """
    choice:      int   = Field(1,    ge=1,   le=2,     description="1 = electricity bill (₹), 2 = direct kWh")
    bill:        float = Field(1200, ge=0,   le=50000, description="Monthly electricity bill in ₹ (used when choice=1)")
    electricity: float = Field(160,  ge=0,   le=5000,  description="Monthly electricity consumption in kWh (used when choice=2)")
    vehicle:     str   = Field("car",                  description="car | bus | bike | electric")
    distance:    float = Field(350,  ge=0,   le=50000, description="Monthly travel distance in km")
    cylinder:    float = Field(1,    ge=0,   le=30,    description="LPG cylinders consumed per month")
    renewable:   int   = Field(1,    ge=1,   le=4,     description="1=None 2=Solar panels 3=Solar heater 4=Both")
    building:    str   = Field("residential",          description="residential | commercial | industrial")
    food:        str   = Field("vegetarian",           description="vegetarian | eggetarian | non-vegetarian")
    members:     int   = Field(3,    ge=1,   le=50,    description="Number of household members")
    recycle:     str   = Field("yes",                  description="yes | no")

    @field_validator("vehicle")
    @classmethod
    def validate_vehicle(cls, v: str) -> str:
        valid = {"car", "bus", "bike", "electric"}
        if v not in valid:
            raise ValueError(f"vehicle must be one of {valid}, got {v!r}")
        return v

    @field_validator("building")
    @classmethod
    def validate_building(cls, v: str) -> str:
        valid = {"residential", "commercial", "industrial"}
        if v not in valid:
            raise ValueError(f"building must be one of {valid}, got {v!r}")
        return v

    @field_validator("food")
    @classmethod
    def validate_food(cls, v: str) -> str:
        valid = {"vegetarian", "eggetarian", "non-vegetarian"}
        if v not in valid:
            raise ValueError(f"food must be one of {valid}, got {v!r}")
        return v

    @field_validator("recycle")
    @classmethod
    def validate_recycle(cls, v: str) -> str:
        if v.lower().strip() not in {"yes", "no"}:
            raise ValueError(f"recycle must be 'yes' or 'no', got {v!r}")
        return v.lower().strip()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@router.post("/calculate")
def carbon_calculate(payload: CarbonRequest):
    """
    Calculate monthly household carbon footprint using the GHG Protocol model.

    Returns a structured result with total emissions, per-category breakdown,
    classification, sustainability score, tree-offset estimate, and
    personalised recommendations. The response schema mirrors
    Carbon.jsx::calculateCarbonFootprint() exactly.
    """
    try:
        result = calculate_carbon_footprint(
            choice=payload.choice,
            bill=payload.bill,
            electricity=payload.electricity,
            vehicle=payload.vehicle,
            distance=payload.distance,
            cylinder=payload.cylinder,
            renewable=payload.renewable,
            building=payload.building,
            food=payload.food,
            members=payload.members,
            recycle=payload.recycle,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error(f"Unexpected error in carbon calculation: {exc}")
        raise HTTPException(status_code=500, detail="Carbon calculation failed.")


@router.get("/factors")
def carbon_factors():
    """
    Return the emission factors used by the calculation model.
    Useful for transparency / audit display in the frontend.
    """
    return {
        "electricity_kg_per_kwh":    _ELECTRICITY_FACTOR,
        "electricity_tariff_rs_kwh": 8.0,
        "vehicle_kg_per_km":         _VEHICLE_FACTORS,
        "lpg_kg_per_cylinder":       _LPG_FACTOR,
        "food_kg_per_month":         _FOOD_FACTORS,
        "tree_offset_kg_per_year":   _TREE_OFFSET_KG_PER_YEAR,
        "renewable_multipliers": {
            "1_none":          1.00,
            "2_solar_panels":  0.85,
            "3_solar_heater":  0.92,
            "4_both":          0.70,
        },
        "building_multipliers": _BUILDING_MULTIPLIERS,
    }
