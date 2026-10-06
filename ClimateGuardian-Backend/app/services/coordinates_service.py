import csv
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Global in-memory dictionary for O(1) city coordinate lookup
# Key: normalized city name (lowercase, stripped)
# Value: dict with "city", "latitude", "longitude"
_CITY_COORDINATES: Dict[str, Dict[str, float]] = {}

DEFAULT_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "city_coordinates.csv"


def load_city_coordinates(csv_path: Optional[str] = None) -> Dict[str, Dict[str, float]]:
    """
    Loads city coordinates from CSV into an in-memory dictionary once at startup.
    Preserves all 40 supported Indian cities for O(1) fast lookup.
    """
    global _CITY_COORDINATES

    target_path = Path(csv_path) if csv_path else DEFAULT_CSV_PATH

    if not target_path.exists():
        logger.warning(f"City coordinates file not found at: {target_path}")
        return _CITY_COORDINATES

    coords: Dict[str, Dict[str, float]] = {}
    try:
        with open(target_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                city_raw = row.get("City", "").strip()
                if not city_raw:
                    continue
                try:
                    lat = float(row["Latitude"])
                    lon = float(row["Longitude"])
                    normalized_key = city_raw.lower()
                    coords[normalized_key] = {
                        "city": city_raw,
                        "latitude": lat,
                        "longitude": lon
                    }
                except (ValueError, KeyError) as err:
                    logger.warning(f"Skipping malformed row for city '{city_raw}': {err}")

        _CITY_COORDINATES = coords
        logger.info(f"Loaded {len(_CITY_COORDINATES)} city coordinates into memory.")
    except Exception as e:
        logger.error(f"Error loading city coordinates from '{target_path}': {e}")

    return _CITY_COORDINATES


def get_city_coordinates(city: str) -> Optional[Tuple[float, float]]:
    """
    Finds latitude and longitude for a city.

    1. Performs O(1) in-memory lookup across pre-indexed 40 Indian cities.
    2. Case-insensitive and whitespace trimmed.
    3. If not found, returns None (controlled result, does not crash).
    """
    if not city or not isinstance(city, str):
        return None

    cleaned_name = city.strip()
    if not cleaned_name:
        return None

    # Auto-load coordinates if not yet initialized
    if not _CITY_COORDINATES:
        load_city_coordinates()

    normalized_key = cleaned_name.lower()

    if normalized_key in _CITY_COORDINATES:
        match = _CITY_COORDINATES[normalized_key]
        return match["latitude"], match["longitude"]

    return None


def get_all_supported_cities() -> List[str]:
    """
    Returns sorted list of all in-memory supported city names.
    """
    if not _CITY_COORDINATES:
        load_city_coordinates()
    return sorted([entry["city"] for entry in _CITY_COORDINATES.values()])

