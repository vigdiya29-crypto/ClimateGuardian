"""
insights_service.py
-------------------
Service providing atmospheric chemistry knowledge, CPCB National Air Quality
Index (NAQI) standards, regulated pollutant benchmarks, personal preventive
actions, and government environmental frameworks.
"""

from typing import List, Dict, Any


_AQI_CATEGORIES: List[Dict[str, Any]] = [
    {
        "range": "0–50",
        "min_aqi": 0,
        "max_aqi": 50,
        "label": "Good",
        "color": "var(--fresh-green)",
        "hex_color": "#10B981",
        "effect": "Minimal impact.",
        "advisory": "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    },
    {
        "range": "51–100",
        "min_aqi": 51,
        "max_aqi": 100,
        "label": "Satisfactory",
        "color": "#7CB342",
        "hex_color": "#7CB342",
        "effect": "Minor breathing discomfort to sensitive people.",
        "advisory": "Air quality is acceptable; however, very sensitive individuals may experience minor symptoms.",
    },
    {
        "range": "101–200",
        "min_aqi": 101,
        "max_aqi": 200,
        "label": "Moderate",
        "color": "var(--warning)",
        "hex_color": "#F59E0B",
        "effect": "Breathing discomfort to people with lung disease.",
        "advisory": "People with lung diseases such as asthma and children and older adults should limit prolonged outdoor exertion.",
    },
    {
        "range": "201–300",
        "min_aqi": 201,
        "max_aqi": 300,
        "label": "Poor",
        "color": "#FB8C00",
        "hex_color": "#FB8C00",
        "effect": "Discomfort on prolonged exposure.",
        "advisory": "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
    },
    {
        "range": "301–400",
        "min_aqi": 301,
        "max_aqi": 400,
        "label": "Very Poor",
        "color": "#E64A19",
        "hex_color": "#E64A19",
        "effect": "Respiratory illness on prolonged exposure.",
        "advisory": "Health warnings of emergency conditions. The entire population is more likely to be affected.",
    },
    {
        "range": "401–500",
        "min_aqi": 401,
        "max_aqi": 500,
        "label": "Severe",
        "color": "var(--danger)",
        "hex_color": "#EF4444",
        "effect": "Affects healthy people, serious for existing patients.",
        "advisory": "Health alert: everyone may experience more serious health effects. Avoid all outdoor physical activity.",
    },
]

_POLLUTANT_INFO: List[Dict[str, Any]] = [
    {
        "key": "pm25",
        "name": "PM2.5",
        "desc": "Fine particulate matter under 2.5 microns, penetrates deep into lungs and bloodstream.",
        "unit": "µg/m³",
        "safe_limit": 60.0,
        "source": "Vehicular combustion, industrial emissions, construction dust, biomass burning",
    },
    {
        "key": "pm10",
        "name": "PM10",
        "desc": "Coarse dust and particulate matter under 10 microns irritating the respiratory tract.",
        "unit": "µg/m³",
        "safe_limit": 100.0,
        "source": "Road dust resuspension, mechanical abrasion, construction activities",
    },
    {
        "key": "no2",
        "name": "NO₂",
        "desc": "Nitrogen dioxide, mainly from vehicle emissions and high-temperature fossil combustion.",
        "unit": "µg/m³",
        "safe_limit": 80.0,
        "source": "Internal combustion engines, thermal power plants, industrial boilers",
    },
    {
        "key": "so2",
        "name": "SO₂",
        "desc": "Sulphur dioxide, released by burning coal/petroleum and smelting mineral ores.",
        "unit": "µg/m³",
        "safe_limit": 80.0,
        "source": "Coal-fired thermal generation, refineries, brick kilns",
    },
    {
        "key": "co",
        "name": "CO",
        "desc": "Carbon monoxide, a colourless and odourless gas from incomplete fuel combustion.",
        "unit": "mg/m³",
        "safe_limit": 4.0,
        "source": "Incomplete combustion in motor vehicles, domestic stoves, biomass burning",
    },
    {
        "key": "ozone",
        "name": "Ozone (O₃)",
        "desc": "Ground-level secondary pollutant formed by photochemical reactions between NOx and VOCs in sunlight.",
        "unit": "µg/m³",
        "safe_limit": 100.0,
        "source": "Secondary atmospheric photochemical formation from vehicular and solvent emissions",
    },
]

_PREVENTIVE_MEASURES: List[Dict[str, Any]] = [
    {
        "id": "pm-1",
        "title": "Wear N95/N99 respirators",
        "desc": "Use certified particulate filtering masks outdoors on High or Critical AQI days.",
        "target_aqi": 200,
    },
    {
        "id": "pm-2",
        "title": "Adjust exercise timing",
        "desc": "Avoid strenuous outdoor cardio workouts when ambient AQI exceeds 200.",
        "target_aqi": 200,
    },
    {
        "id": "pm-3",
        "title": "Deploy HEPA air filtration indoors",
        "desc": "Run True-HEPA air purifiers in bedrooms and living spaces to reduce indoor PM2.5.",
        "target_aqi": 100,
    },
    {
        "id": "pm-4",
        "title": "Incorporate purifying houseplants",
        "desc": "Snake plants, Areca palms, and Peace Lilies help supplement indoor oxygenation.",
        "target_aqi": 50,
    },
]

_GOVERNMENT_GUIDELINES: List[Dict[str, Any]] = [
    {
        "id": "gov-1",
        "title": "CPCB National Air Quality Index (NAQI)",
        "desc": "One Number-One Color-One Description system standardizing daily national reporting.",
        "authority": "Central Pollution Control Board",
    },
    {
        "id": "gov-2",
        "title": "Graded Response Action Plan (GRAP)",
        "desc": "Emergency phased anti-pollution interventions deployed across NCR during winter smog spikes.",
        "authority": "Commission for Air Quality Management (CAQM)",
    },
    {
        "id": "gov-3",
        "title": "National Clean Air Programme (NCAP)",
        "desc": "City-specific targeted reduction mandates aiming for a 20–30% PM reduction nationwide.",
        "authority": "Ministry of Environment, Forest and Climate Change (MoEFCC)",
    },
    {
        "id": "gov-4",
        "title": "Bharat Stage VI (BS-VI) Emission Norms",
        "desc": "Strict vehicular emission standard reducing NOx output by up to 70% in diesel vehicles.",
        "authority": "Ministry of Road Transport and Highways (MoRTH)",
    },
]


def get_aqi_categories() -> List[Dict[str, Any]]:
    """Returns the official CPCB NAQI standard categories."""
    return _AQI_CATEGORIES


def get_pollutant_info() -> List[Dict[str, Any]]:
    """Returns regulated air pollutant profiles and safe threshold limits."""
    return _POLLUTANT_INFO


def get_preventive_measures() -> List[Dict[str, Any]]:
    """Returns personal health action guidelines."""
    return _PREVENTIVE_MEASURES


def get_government_guidelines() -> List[Dict[str, Any]]:
    """Returns national policy directives and statutory frameworks."""
    return _GOVERNMENT_GUIDELINES


def get_all_insights() -> Dict[str, Any]:
    """Returns complete atmospheric chemistry knowledge and standards bundle."""
    return {
        "aqi_categories": _AQI_CATEGORIES,
        "pollutants": _POLLUTANT_INFO,
        "preventive_measures": _PREVENTIVE_MEASURES,
        "government_guidelines": _GOVERNMENT_GUIDELINES,
    }
