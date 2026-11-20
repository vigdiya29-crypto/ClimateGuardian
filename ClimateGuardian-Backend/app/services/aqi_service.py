import asyncio
import logging
from typing import Dict, Any, Optional, Tuple, List
import httpx
import pandas as pd

from app.config import get_settings
from app.services.coordinates_service import get_city_coordinates

logger = logging.getLogger(__name__)
settings = get_settings()


class UpstreamAPIError(Exception):
    """Raised when an external API (Open-Meteo) call fails or times out."""
    pass


# HTTP status codes that indicate a transient server-side problem worth retrying.
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
# Maximum number of attempts (1 original + 2 retries).
_MAX_ATTEMPTS = 3
# Base delay in seconds; doubles each attempt (1 s, 2 s).
_BASE_BACKOFF_SECONDS = 1.0


async def _http_get_with_retry(
    client: httpx.AsyncClient,
    url: str,
    params: Dict[str, Any],
    label: str,
) -> httpx.Response:
    """
    Perform a GET request with bounded exponential-backoff retries for
    transient HTTP errors (429, 500, 502, 503, 504) and timeout exceptions.

    Args:
        client:  An already-configured httpx.AsyncClient.
        url:     Target URL.
        params:  Query parameters dict.
        label:   Human-readable label used only in log messages.

    Returns:
        The successful httpx.Response.

    Raises:
        UpstreamAPIError: After all attempts are exhausted, or immediately for
                          non-retryable HTTP status codes.
    """
    last_exc: Optional[Exception] = None
    delay = _BASE_BACKOFF_SECONDS

    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            response = await client.get(url, params=params)

            if response.status_code not in _RETRYABLE_STATUS_CODES:
                # Either success (2xx) or a client error we should not retry.
                response.raise_for_status()
                return response

            # Retryable HTTP error.
            last_exc = httpx.HTTPStatusError(
                f"HTTP {response.status_code}",
                request=response.request,
                response=response,
            )
            logger.warning(
                f"{label}: attempt {attempt}/{_MAX_ATTEMPTS} got HTTP "
                f"{response.status_code}; "
                + (f"retrying in {delay:.0f}s…" if attempt < _MAX_ATTEMPTS else "giving up.")
            )

        except httpx.TimeoutException as exc:
            last_exc = exc
            logger.warning(
                f"{label}: attempt {attempt}/{_MAX_ATTEMPTS} timed out; "
                + (f"retrying in {delay:.0f}s…" if attempt < _MAX_ATTEMPTS else "giving up.")
            )

        if attempt < _MAX_ATTEMPTS:
            await asyncio.sleep(delay)
            delay *= 2  # exponential backoff

    # All attempts failed.
    if isinstance(last_exc, httpx.TimeoutException):
        raise UpstreamAPIError(f"{label} timed out after {_MAX_ATTEMPTS} attempts.") from last_exc
    raise UpstreamAPIError(
        f"{label} returned a retryable error after {_MAX_ATTEMPTS} attempts."
    ) from last_exc


async def fetch_weather(
    latitude: float,
    longitude: float,
    client: Optional[httpx.AsyncClient] = None
) -> Dict[str, Any]:
    """
    Asynchronously fetch current weather from Open-Meteo forecast API.
    Uses surface_pressure for compatibility with XGBoost training.
    """
    url = settings.OPEN_METEO_FORECAST_URL
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "surface_pressure,"
            "wind_speed_10m,"
            "precipitation,"
            "weather_code"
        ),
        "timezone": "auto"
    }

    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=settings.OPEN_METEO_TIMEOUT_SECONDS)
        should_close = True

    try:
        response = await _http_get_with_retry(
            client, url, params, label="Open-Meteo weather API"
        )
        data = response.json()
        if "current" not in data:
            raise UpstreamAPIError("Open-Meteo forecast response missing 'current' payload.")
        return data["current"]
    except UpstreamAPIError:
        raise
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from Open-Meteo weather API: {e.response.status_code}")
        raise UpstreamAPIError(f"Weather service returned HTTP {e.response.status_code}") from e
    except Exception as e:
        logger.error(f"Unexpected error fetching weather: {e}")
        raise UpstreamAPIError(f"Failed to fetch weather: {e}") from e
    finally:
        if should_close:
            await client.aclose()


async def fetch_air_quality(
    latitude: float,
    longitude: float,
    client: Optional[httpx.AsyncClient] = None
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Asynchronously fetch current and hourly air quality pollutant values from Open-Meteo.
    Retrieves past 24 hours of hourly data to compute lag and rolling features.
    """
    url = settings.OPEN_METEO_AIR_QUALITY_URL
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "pm2_5,"
            "pm10,"
            "carbon_monoxide,"
            "nitrogen_dioxide,"
            "sulphur_dioxide,"
            "ozone,"
            "us_aqi"
        ),
        "hourly": (
            "pm2_5,"
            "pm10,"
            "carbon_monoxide,"
            "nitrogen_dioxide,"
            "sulphur_dioxide,"
            "ozone,"
            "us_aqi"
        ),
        "past_days": 1,
        "forecast_days": 1,
        "timezone": "auto"
    }

    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=settings.OPEN_METEO_TIMEOUT_SECONDS)
        should_close = True

    try:
        response = await _http_get_with_retry(
            client, url, params, label="Open-Meteo air-quality API"
        )
        data = response.json()
        if "current" not in data or "hourly" not in data:
            raise UpstreamAPIError("Open-Meteo air-quality response missing 'current' or 'hourly' payload.")
        return data["current"], data["hourly"]
    except UpstreamAPIError:
        raise
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from Open-Meteo air-quality API: {e.response.status_code}")
        raise UpstreamAPIError(f"Air quality service returned HTTP {e.response.status_code}") from e
    except Exception as e:
        logger.error(f"Unexpected error fetching air quality: {e}")
        raise UpstreamAPIError(f"Failed to fetch air quality: {e}") from e
    finally:
        if should_close:
            await client.aclose()


def compute_lag_and_rolling_features(
    hourly: Dict[str, Any],
    current_time_str: str
) -> Dict[str, Any]:
    """
    Dynamically derives lag and rolling features from Open-Meteo hourly telemetry:
    - AQI_Lag1: immediately preceding hour's US AQI (from Open-Meteo us_aqi at t-1). NEVER PM2.5.
    - PM25_Lag1: immediately preceding hour's PM2.5 (from Open-Meteo pm2_5 at t-1).
    - PM10_Lag1: immediately preceding hour's PM10 (from Open-Meteo pm10 at t-1).
    - PM25_Roll3: mean PM2.5 over the 3-hour window [t-2, t-1, t].
    - PM10_Roll3: mean PM10 over the 3-hour window [t-2, t-1, t].
    """
    times: List[str] = hourly.get("time", [])
    us_aqi_list: List[Optional[float]] = hourly.get("us_aqi", [])
    pm25_list: List[Optional[float]] = hourly.get("pm2_5", [])
    pm10_list: List[Optional[float]] = hourly.get("pm10", [])

    if not times or not pm25_list:
        raise UpstreamAPIError("Hourly telemetry data is empty in Open-Meteo response.")

    # Normalize current_time_str (e.g. "2026-09-16T22:00:00" -> "2026-09-16T22:00")
    norm_time = current_time_str[:13] + ":00" if len(current_time_str) >= 16 else current_time_str

    target_idx = None
    if norm_time in times:
        target_idx = times.index(norm_time)
    elif current_time_str in times:
        target_idx = times.index(current_time_str)
    else:
        # Match latest hourly timestamp <= norm_time
        for i in range(len(times) - 1, -1, -1):
            if times[i] <= norm_time and pm25_list[i] is not None:
                target_idx = i
                break

    if target_idx is None:
        target_idx = len(times) - 1

    # Preceding hour index (t-1)
    lag1_idx = max(0, target_idx - 1)

    # 1. AQI_Lag1: strictly from Open-Meteo us_aqi at t-1
    previous_hour_us_aqi = None
    if us_aqi_list and lag1_idx < len(us_aqi_list):
        if us_aqi_list[lag1_idx] is not None:
            previous_hour_us_aqi = float(us_aqi_list[lag1_idx])
        else:
            # Search backwards for nearest preceding valid us_aqi
            for i in range(lag1_idx - 1, -1, -1):
                if us_aqi_list[i] is not None:
                    previous_hour_us_aqi = float(us_aqi_list[i])
                    break

    if previous_hour_us_aqi is None:
        logger.warning("Open-Meteo hourly us_aqi not available for preceding hour. Defaulting to 50.0")
        previous_hour_us_aqi = 50.0

    aqi_lag1 = float(previous_hour_us_aqi)

    # 2. PM25_Lag1: preceding hour PM2.5 at t-1 (do NOT use current value)
    previous_hour_pm25 = None
    if pm25_list and lag1_idx < len(pm25_list):
        if pm25_list[lag1_idx] is not None:
            previous_hour_pm25 = float(pm25_list[lag1_idx])
        else:
            for i in range(lag1_idx - 1, -1, -1):
                if pm25_list[i] is not None:
                    previous_hour_pm25 = float(pm25_list[i])
                    break

    if previous_hour_pm25 is None:
        previous_hour_pm25 = 25.0

    pm25_lag1 = float(previous_hour_pm25)

    # 3. PM10_Lag1: preceding hour PM10 at t-1 (do NOT use current value)
    previous_hour_pm10 = None
    if pm10_list and lag1_idx < len(pm10_list):
        if pm10_list[lag1_idx] is not None:
            previous_hour_pm10 = float(pm10_list[lag1_idx])
        else:
            for i in range(lag1_idx - 1, -1, -1):
                if pm10_list[i] is not None:
                    previous_hour_pm10 = float(pm10_list[i])
                    break

    if previous_hour_pm10 is None:
        previous_hour_pm10 = 50.0

    pm10_lag1 = float(previous_hour_pm10)

    # 4. PM25_Roll3: mean of PM2.5 over [target_idx - 2, target_idx - 1, target_idx]
    roll_start_idx = max(0, target_idx - 2)
    pm25_window = [
        float(pm25_list[i])
        for i in range(roll_start_idx, target_idx + 1)
        if i < len(pm25_list) and pm25_list[i] is not None
    ]
    if pm25_window:
        pm25_roll3 = round(sum(pm25_window) / len(pm25_window), 2)
    else:
        pm25_roll3 = pm25_lag1

    # 5. PM10_Roll3: mean of PM10 over [target_idx - 2, target_idx - 1, target_idx]
    pm10_window = [
        float(pm10_list[i])
        for i in range(roll_start_idx, target_idx + 1)
        if i < len(pm10_list) and pm10_list[i] is not None
    ]
    if pm10_window:
        pm10_roll3 = round(sum(pm10_window) / len(pm10_window), 2)
    else:
        pm10_roll3 = pm10_lag1

    current_pm25 = float(pm25_list[target_idx]) if target_idx < len(pm25_list) and pm25_list[target_idx] is not None else None
    current_pm10 = float(pm10_list[target_idx]) if target_idx < len(pm10_list) and pm10_list[target_idx] is not None else None

    return {
        "AQI_Lag1": aqi_lag1,
        "PM25_Lag1": pm25_lag1,
        "PM10_Lag1": pm10_lag1,
        "PM25_Roll3": pm25_roll3,
        "PM10_Roll3": pm10_roll3,
        # Telemetry verification metadata
        "previous_hour_us_aqi": previous_hour_us_aqi,
        "previous_hour_pm25": previous_hour_pm25,
        "previous_hour_pm10": previous_hour_pm10,
        "current_pm25": current_pm25,
        "current_pm10": current_pm10,
        "target_timestamp": times[target_idx] if target_idx < len(times) else current_time_str,
        "previous_timestamp": times[lag1_idx] if lag1_idx < len(times) else None
    }


def get_aqi_category(aqi: float) -> str:
    """
    Convert predicted AQI into a readable category using the canonical 6-tier scale.
    """
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"


async def predict_aqi(
    city: str,
    model=None,
    client: Optional[httpx.AsyncClient] = None
) -> Dict[str, Any]:
    """
    AQI prediction function using the canonical 22-feature XGBoost model.
    Receives model instance from FastAPI app.state.model.
    """
    if model is None:
        raise ValueError("XGBoost model is not loaded in application state.")

    coords = get_city_coordinates(city)
    if not coords:
        raise ValueError(f"City '{city}' not found in coordinate database.")

    latitude, longitude = coords

    should_close = False
    if client is None:
        client = httpx.AsyncClient(timeout=settings.OPEN_METEO_TIMEOUT_SECONDS)
        should_close = True

    try:
        # Concurrently or sequentially fetch weather and air quality
        weather_current = await fetch_weather(latitude, longitude, client=client)
        air_quality_current, air_quality_hourly = await fetch_air_quality(latitude, longitude, client=client)

        current_time_str = weather_current.get("time") or air_quality_current.get("time")
        if current_time_str:
            dt = pd.to_datetime(current_time_str)
        else:
            dt = pd.Timestamp.now()

        # Dynamic calculation of lag and rolling features from real hourly telemetry
        derived_features = compute_lag_and_rolling_features(air_quality_hourly, str(current_time_str))

        # Build EXACTLY the 22 features expected by the model in canonical order
        feature_dict = {
            "PM2.5": float(air_quality_current["pm2_5"]),
            "PM10": float(air_quality_current["pm10"]),
            "CO": float(air_quality_current["carbon_monoxide"]),
            "NO2": float(air_quality_current["nitrogen_dioxide"]),
            "SO2": float(air_quality_current["sulphur_dioxide"]),
            "Ozone": float(air_quality_current["ozone"]),

            "Temperature": float(weather_current["temperature_2m"]),
            "Humidity": float(weather_current["relative_humidity_2m"]),
            "Pressure": float(weather_current["surface_pressure"]),
            "WindSpeed": float(weather_current["wind_speed_10m"]),
            "Rain": float(weather_current["precipitation"]),
            "WeatherCode": float(weather_current["weather_code"]),

            "Hour": int(dt.hour),
            "Day": int(dt.day),
            "Month": int(dt.month),
            "DayOfWeek": int(dt.weekday()),
            "IsWeekend": int(dt.weekday() >= 5),

            "AQI_Lag1": float(derived_features["AQI_Lag1"]),
            "PM25_Lag1": float(derived_features["PM25_Lag1"]),
            "PM10_Lag1": float(derived_features["PM10_Lag1"]),
            "PM25_Roll3": float(derived_features["PM25_Roll3"]),
            "PM10_Roll3": float(derived_features["PM10_Roll3"])
        }

        feature_order = [
            "PM2.5", "PM10", "CO", "NO2", "SO2", "Ozone",
            "Temperature", "Humidity", "Pressure", "WindSpeed", "Rain", "WeatherCode",
            "Hour", "Day", "Month", "DayOfWeek", "IsWeekend",
            "AQI_Lag1", "PM25_Lag1", "PM10_Lag1", "PM25_Roll3", "PM10_Roll3"
        ]

        features_df = pd.DataFrame([feature_dict])[feature_order]

        prediction = float(model.predict(features_df)[0])
        prediction = max(0.0, round(prediction, 2))

        return {
            "city": city,
            "predicted_aqi": prediction,
            "category": get_aqi_category(prediction),
            "weather": {
                "temperature": weather_current["temperature_2m"],
                "humidity": weather_current["relative_humidity_2m"],
                "pressure": weather_current["surface_pressure"],
                "wind_speed": weather_current["wind_speed_10m"],
                "rain": weather_current["precipitation"],
                "weather_code": weather_current["weather_code"]
            },
            "pollutants": {
                "pm2_5": air_quality_current["pm2_5"],
                "pm10": air_quality_current["pm10"],
                "co": air_quality_current["carbon_monoxide"],
                "no2": air_quality_current["nitrogen_dioxide"],
                "so2": air_quality_current["sulphur_dioxide"],
                "ozone": air_quality_current["ozone"],
                "us_aqi": air_quality_current.get("us_aqi")
            },
            "features": feature_dict,
            "telemetry_debug": {
                "current_pm25": derived_features.get("current_pm25"),
                "previous_hour_pm25": derived_features.get("previous_hour_pm25"),
                "current_pm10": derived_features.get("current_pm10"),
                "previous_hour_pm10": derived_features.get("previous_hour_pm10"),
                "previous_hour_us_aqi": derived_features.get("previous_hour_us_aqi"),
                "AQI_Lag1": derived_features["AQI_Lag1"],
                "PM25_Roll3": derived_features["PM25_Roll3"],
                "PM10_Roll3": derived_features["PM10_Roll3"]
            }
        }
    finally:
        if should_close:
            await client.aclose()


async def get_current_weather(
    city: str,
    client: Optional[httpx.AsyncClient] = None
) -> Dict[str, Any]:
    """
    Get current weather for a city using Open-Meteo API.
    """
    coords = get_city_coordinates(city)
    if not coords:
        raise ValueError(f"City '{city}' not found in coordinate database.")

    latitude, longitude = coords
    weather_current = await fetch_weather(latitude, longitude, client=client)

    return {
        "city": city,
        "latitude": latitude,
        "longitude": longitude,
        "temperature": weather_current["temperature_2m"],
        "relative_humidity": weather_current["relative_humidity_2m"],
        "surface_pressure": weather_current["surface_pressure"],
        "wind_speed": weather_current["wind_speed_10m"],
        "rain": weather_current["precipitation"],
        "weather_code": weather_current["weather_code"],
        "time": weather_current.get("time")
    }