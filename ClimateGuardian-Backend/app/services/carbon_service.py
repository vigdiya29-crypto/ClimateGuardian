"""
carbon_service.py
-----------------
Pure-Python implementation of the GHG Protocol emission model used by the
ClimateGuardian Carbon Footprint Calculator.

The formula mirrors Carbon.jsx::calculateCarbonFootprint() exactly so that
the backend and frontend produce identical results for identical inputs.
No ML model is involved; this is a deterministic rule-based calculation.

Emission factors used (India-specific):
  - Electricity : 0.82 kg CO₂ / kWh  (CEA grid emission factor)
  - Car          : 0.19 kg CO₂ / km
  - Bus          : 0.08 kg CO₂ / km
  - Motorbike    : 0.10 kg CO₂ / km
  - Electric EV  : 0.04 kg CO₂ / km
  - LPG cylinder : 42.00 kg CO₂ / cylinder
  - Vegetarian   : 40   kg CO₂ / month
  - Eggetarian   : 55   kg CO₂ / month
  - Non-veg      : 80   kg CO₂ / month
  - Tree offset  : 21   kg CO₂ / tree / year  (IPCC reference)
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Emission Factors
# ---------------------------------------------------------------------------
_ELECTRICITY_FACTOR: float = 0.82      # kg CO₂ / kWh
_ELECTRICITY_TARIFF: float = 8.0       # ₹ / kWh (for bill-to-units conversion)

_VEHICLE_FACTORS: Dict[str, float] = {
    "car":      0.19,
    "bus":      0.08,
    "bike":     0.10,
    "electric": 0.04,
}

_LPG_FACTOR: float = 42.0             # kg CO₂ / cylinder

_FOOD_FACTORS: Dict[str, float] = {
    "vegetarian":     40.0,
    "eggetarian":     55.0,
    "non-vegetarian": 80.0,
}

_TREE_OFFSET_KG_PER_YEAR: float = 21.0   # kg CO₂ / tree / year

# Renewable energy reduction multipliers
_RENEWABLE_MULTIPLIERS: Dict[int, float] = {
    1: 1.00,   # None
    2: 0.85,   # Solar panels
    3: 0.92,   # Solar water heater
    4: 0.70,   # Both
}

# Building type electricity scaling
_BUILDING_MULTIPLIERS: Dict[str, float] = {
    "residential": 1.00,
    "commercial":  1.15,
    "industrial":  1.35,
}


# ---------------------------------------------------------------------------
# Category / Score helpers
# ---------------------------------------------------------------------------
def _classify(total_kg: float) -> Dict[str, Any]:
    """Return category label, badge class, and sustainability score."""
    if total_kg <= 100:
        return {"category": "Low",      "badge_class": "badge-good",     "score": 95}
    if total_kg <= 300:
        return {"category": "Moderate", "badge_class": "badge-moderate", "score": 85}
    if total_kg <= 600:
        return {"category": "High",     "badge_class": "badge-poor",     "score": 65}
    return     {"category": "Critical", "badge_class": "badge-poor",     "score": 40}


def _build_recommendations(
    electricity_kg: float,
    vehicle_kg: float,
    gas_kg: float,
    renewable: int,
    vehicle: str,
    food: str,
    recycle: str,
) -> List[Dict[str, str]]:
    """Generate contextual recommendations, mirroring Carbon.jsx logic."""
    recs: List[Dict[str, str]] = []

    if electricity_kg > 80 and renewable == 1:
        recs.append({
            "title":  "Switch to Solar Energy",
            "desc":   "Installing rooftop solar panels or a solar water heater can reduce "
                      "your electricity emissions by up to 30%.",
            "saving": "~30% Electricity CO₂",
        })

    if vehicle_kg > 40 and vehicle == "car":
        recs.append({
            "title":  "Consider EV or Public Transit",
            "desc":   "Switching to an EV, carpooling, or public buses significantly "
                      "drops transportation emissions.",
            "saving": "Up to 0.15 kg/km",
        })

    if food == "non-vegetarian":
        recs.append({
            "title":  "Shift Toward Plant-Based Meals",
            "desc":   "Reducing meat consumption lowers your food carbon footprint by "
                      "up to 50%.",
            "saving": "-40 kg CO₂/mo",
        })

    if recycle == "no":
        recs.append({
            "title":  "Enable Household Recycling",
            "desc":   "Sorting paper, plastics, and metals grants an immediate 3% model "
                      "reduction.",
            "saving": "-3% Total CO₂",
        })

    if gas_kg > 40:
        recs.append({
            "title":  "Optimize Cooking Efficiency",
            "desc":   "Using induction cooktops or pressure cookers helps reduce monthly "
                      "LPG cylinder consumption.",
            "saving": "-20 kg CO₂/mo",
        })

    if not recs:
        recs.append({
            "title":  "Maintain Eco-Friendly Habits",
            "desc":   "Your current choices keep emissions low. Continue tracking monthly "
                      "to sustain high efficiency.",
            "saving": "Optimal Impact",
        })

    return recs


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def calculate_carbon_footprint(
    *,
    choice: int,           # 1 = electricity bill (₹), 2 = direct kWh
    bill: float,           # Monthly electricity bill in ₹ (used when choice == 1)
    electricity: float,    # Monthly electricity consumption in kWh (choice == 2)
    vehicle: str,          # "car" | "bus" | "bike" | "electric"
    distance: float,       # Monthly travel distance in km
    cylinder: float,       # LPG cylinders consumed per month
    renewable: int,        # 1–4 (see RENEWABLE_MULTIPLIERS)
    building: str,         # "residential" | "commercial" | "industrial"
    food: str,             # "vegetarian" | "eggetarian" | "non-vegetarian"
    members: int,          # Number of household members
    recycle: str,          # "yes" | "no"
) -> Dict[str, Any]:
    """
    Calculate monthly carbon footprint and return a structured result dict
    whose schema matches Carbon.jsx::calculateCarbonFootprint() exactly.

    Raises:
        ValueError: If any input value is out of valid range or unrecognised.
    """
    # --- Validate & normalise inputs ---
    if choice not in (1, 2):
        raise ValueError(f"'choice' must be 1 (bill) or 2 (kWh), got {choice!r}")

    if vehicle not in _VEHICLE_FACTORS:
        raise ValueError(
            f"Unrecognised vehicle type {vehicle!r}. "
            f"Valid values: {list(_VEHICLE_FACTORS)}"
        )

    if renewable not in _RENEWABLE_MULTIPLIERS:
        raise ValueError(
            f"'renewable' must be 1–4, got {renewable!r}"
        )

    if building not in _BUILDING_MULTIPLIERS:
        raise ValueError(
            f"Unrecognised building type {building!r}. "
            f"Valid values: {list(_BUILDING_MULTIPLIERS)}"
        )

    if food not in _FOOD_FACTORS:
        raise ValueError(
            f"Unrecognised food type {food!r}. "
            f"Valid values: {list(_FOOD_FACTORS)}"
        )

    members = max(1, int(members))
    distance = max(0.0, float(distance))
    cylinder = max(0.0, float(cylinder))
    bill = max(0.0, float(bill))
    electricity = max(0.0, float(electricity))
    recycle = str(recycle).lower().strip()

    # --- 1. Electricity ---
    electricity_units: float = (
        bill / _ELECTRICITY_TARIFF if choice == 1 else electricity
    )
    electricity_kg: float = electricity_units * _ELECTRICITY_FACTOR
    electricity_kg *= _RENEWABLE_MULTIPLIERS[renewable]
    electricity_kg *= _BUILDING_MULTIPLIERS[building]

    # --- 2. Transportation ---
    vehicle_kg: float = distance * _VEHICLE_FACTORS[vehicle]

    # --- 3. Cooking fuel (LPG) ---
    gas_kg: float = cylinder * _LPG_FACTOR

    # --- 4. Food ---
    food_kg: float = _FOOD_FACTORS[food]

    # --- 5. Subtotal + recycling reduction ---
    subtotal: float = electricity_kg + vehicle_kg + gas_kg + food_kg
    total_kg: float = subtotal * 0.97 if recycle == "yes" else subtotal

    # --- Round to 2 dp (mirrors frontend's toFixed(2) → Number()) ---
    total_kg       = round(total_kg, 2)
    electricity_kg = round(electricity_kg, 2)
    vehicle_kg     = round(vehicle_kg, 2)
    gas_kg         = round(gas_kg, 2)
    food_kg        = round(food_kg, 2)
    per_person_kg  = round(total_kg / members, 2)

    # --- Classification ---
    classification = _classify(total_kg)

    # --- Tree offset ---
    trees_required = round(total_kg / (_TREE_OFFSET_KG_PER_YEAR / 12))  # monthly

    # --- Breakdown list ---
    def _pct(part: float) -> int:
        return round((part / total_kg) * 100) if total_kg > 0 else 0

    breakdown: List[Dict[str, Any]] = [
        {
            "key":        "electricity",
            "label":      "Electricity",
            "value":      electricity_kg,
            "percentage": _pct(electricity_kg),
            "pct":        _pct(electricity_kg),
            "color":      "#3B82F6",
        },
        {
            "key":        "vehicle",
            "label":      "Transportation",
            "value":      vehicle_kg,
            "percentage": _pct(vehicle_kg),
            "pct":        _pct(vehicle_kg),
            "color":      "#10B981",
        },
        {
            "key":        "gas",
            "label":      "Cooking Fuel",
            "value":      gas_kg,
            "percentage": _pct(gas_kg),
            "pct":        _pct(gas_kg),
            "color":      "#F59E0B",
        },
        {
            "key":        "food",
            "label":      "Food",
            "value":      food_kg,
            "percentage": _pct(food_kg),
            "pct":        _pct(food_kg),
            "color":      "#EC4899",
        },
    ]

    # Largest contributor
    largest = max(breakdown, key=lambda x: x["value"])

    # Recommendations
    recommendations = _build_recommendations(
        electricity_kg, vehicle_kg, gas_kg,
        renewable, vehicle, food, recycle,
    )

    return {
        # Primary fields (matches Carbon.jsx return object)
        "total_emission":         total_kg,
        "totalKg":                total_kg,
        "category":               classification["category"],
        "badgeClass":             classification["badge_class"],
        "badge_class":            classification["badge_class"],
        "score":                  classification["score"],
        "sustainabilityScore":    classification["score"],
        "trees_required":         trees_required,
        "treesRequired":          trees_required,
        "per_person":             per_person_kg,
        "perPersonKg":            per_person_kg,

        # Emission breakdown
        "electricity_emission":   electricity_kg,
        "vehicle_emission":       vehicle_kg,
        "gas_emission":           gas_kg,
        "food_emission":          food_kg,

        # Structured breakdown + meta
        "breakdown":              breakdown,
        "largestContributor":     largest,
        "recommendations":        recommendations,

        # Emission factors used (audit trail)
        "emission_factors": {
            "electricity_kg_per_kwh": _ELECTRICITY_FACTOR,
            "vehicle_kg_per_km":      _VEHICLE_FACTORS[vehicle],
            "lpg_kg_per_cylinder":    _LPG_FACTOR,
            "food_kg_per_month":      food_kg,
            "tree_offset_kg_per_year": _TREE_OFFSET_KG_PER_YEAR,
        },
    }
