import sys
import os
from unittest.mock import patch
import httpx
from fastapi.testclient import TestClient

def main():
    print("==================================================")
    print("         PHASE C VERIFICATION TEST SUITE          ")
    print("==================================================")

    from app.main import app

    with TestClient(app) as client:
        # 1. Model taken from app.state.model
        print("\n[TEST 1] Model Loaded in app.state.model")
        model = getattr(app.state, "model", None)
        assert model is not None, "Model was not loaded in app.state!"
        print(f"-> Model type: {type(model).__name__}")
        print("-> RESULT: PASS")

        # 2. Delhi Live AQI Prediction
        print("\n[TEST 2] Delhi Live AQI Prediction")
        res_delhi = client.get("/api/aqi/predict?city=Delhi")
        print(f"-> GET /api/aqi/predict?city=Delhi status: {res_delhi.status_code}")
        assert res_delhi.status_code == 200, f"Failed Delhi prediction: {res_delhi.text}"
        data_delhi = res_delhi.json()
        print(f"-> Predicted AQI: {data_delhi['predicted_aqi']} ({data_delhi['category']})")
        print(f"-> Weather sample: temp={data_delhi['weather']['temperature']}°C, pressure={data_delhi['weather']['pressure']}hPa")
        print(f"-> Pollutants sample: PM2.5={data_delhi['pollutants']['pm2_5']}, PM10={data_delhi['pollutants']['pm10']}")
        print(f"-> Features: AQI_Lag1={data_delhi['features']['AQI_Lag1']}, PM25_Lag1={data_delhi['features']['PM25_Lag1']}, PM25_Roll3={data_delhi['features']['PM25_Roll3']}")
        print("-> RESULT: PASS")

        # 3. Mumbai Live AQI Prediction
        print("\n[TEST 3] Mumbai Live AQI Prediction")
        res_mumbai = client.get("/api/aqi/predict?city=Mumbai")
        print(f"-> GET /api/aqi/predict?city=Mumbai status: {res_mumbai.status_code}")
        assert res_mumbai.status_code == 200, f"Failed Mumbai prediction: {res_mumbai.text}"
        data_mumbai = res_mumbai.json()
        print(f"-> Mumbai Predicted AQI: {data_mumbai['predicted_aqi']} ({data_mumbai['category']})")
        print("-> RESULT: PASS")

        # 4. Unknown City Controlled Response
        print("\n[TEST 4] Unknown City Controlled Response (HTTP 404)")
        res_unknown = client.get("/api/aqi/predict?city=UnknownCityXYZ")
        print(f"-> GET /api/aqi/predict?city=UnknownCityXYZ status: {res_unknown.status_code}")
        print(f"-> Body: {res_unknown.json()}")
        assert res_unknown.status_code == 404
        assert "not found" in res_unknown.json()["detail"].lower()
        print("-> RESULT: PASS")

        # 5. Live Weather Endpoint
        print("\n[TEST 5] Live Weather Endpoint: GET /api/weather/current?city=Delhi")
        res_weather = client.get("/api/weather/current?city=Delhi")
        print(f"-> GET /api/weather/current?city=Delhi status: {res_weather.status_code}")
        assert res_weather.status_code == 200, f"Weather endpoint failed: {res_weather.text}"
        w_data = res_weather.json()
        print(f"-> Weather response keys: {list(w_data.keys())}")
        assert "temperature" in w_data
        assert "surface_pressure" in w_data
        assert "relative_humidity" in w_data
        print(f"-> Surface pressure used: {w_data['surface_pressure']} hPa")
        print("-> RESULT: PASS")

        # 6. Verify Exact 22 Features and Order in Model
        print("\n[TEST 6] Canonical 22-Feature Construction & Exact Ordering")
        expected_features = [
            "PM2.5", "PM10", "CO", "NO2", "SO2", "Ozone",
            "Temperature", "Humidity", "Pressure", "WindSpeed", "Rain", "WeatherCode",
            "Hour", "Day", "Month", "DayOfWeek", "IsWeekend",
            "AQI_Lag1", "PM25_Lag1", "PM10_Lag1", "PM25_Roll3", "PM10_Roll3"
        ]
        actual_model_features = list(model.feature_names_in_)
        assert actual_model_features == expected_features, f"Feature order mismatch: {actual_model_features}"
        print(f"-> Verified all {len(actual_model_features)} features match canonical order:")
        for idx, f in enumerate(actual_model_features, 1):
            print(f"   {idx}. {f}")
        print("-> RESULT: PASS")

        # 7. Lag & Rolling Values Logic Verification
        print("\n[TEST 7] Lag & Rolling Features: Strict Verification of AQI_Lag1 == previous_hour_us_aqi (NOT PM2.5)")
        from app.services.aqi_service import compute_lag_and_rolling_features
        # Mock telemetry dataset with clearly distinct values
        mock_hourly = {
            "time": ["2026-09-16T18:00", "2026-09-16T19:00", "2026-09-16T20:00", "2026-09-16T21:00"],
            "us_aqi": [180.0, 195.0, 210.0, 225.0],
            "pm2_5": [45.0, 52.0, 68.0, 75.0],
            "pm10": [85.0, 92.0, 110.0, 125.0]
        }
        computed = compute_lag_and_rolling_features(mock_hourly, "2026-09-16T21:00")
        print(f"-> Mock Hourly at 21:00:")
        print(f"   previous-hour (20:00) us_aqi = {mock_hourly['us_aqi'][2]}")
        print(f"   previous-hour (20:00) pm2_5  = {mock_hourly['pm2_5'][2]}")
        print(f"   AQI_Lag1                     = {computed['AQI_Lag1']}")
        print(f"   PM25_Lag1                    = {computed['PM25_Lag1']}")
        print(f"   PM10_Lag1                    = {computed['PM10_Lag1']}")
        print(f"   PM25_Roll3                   = {computed['PM25_Roll3']} (mean of 52, 68, 75)")
        print(f"   PM10_Roll3                   = {computed['PM10_Roll3']} (mean of 92, 110, 125)")

        assert computed["AQI_Lag1"] == 210.0
        assert computed["PM25_Lag1"] == 68.0
        assert computed["PM10_Lag1"] == 110.0
        assert computed["PM25_Roll3"] == 65.0
        assert computed["PM10_Roll3"] == 109.0

        # Strict checks
        assert computed["AQI_Lag1"] == computed["previous_hour_us_aqi"], "AQI_Lag1 must equal previous_hour_us_aqi!"
        assert computed["AQI_Lag1"] != computed["previous_hour_pm25"], "CRITICAL: AQI_Lag1 must NOT equal PM2.5!"
        assert computed["AQI_Lag1"] != computed["current_pm25"], "CRITICAL: AQI_Lag1 must NOT equal current PM2.5!"

        # Live Delhi response check
        delhi_dbg = data_delhi.get("telemetry_debug", {})
        if delhi_dbg:
            print(f"-> Live Delhi Telemetry:")
            print(f"   current PM2.5        : {delhi_dbg.get('current_pm25')}")
            print(f"   previous-hour PM2.5  : {delhi_dbg.get('previous_hour_pm25')}")
            print(f"   current PM10         : {delhi_dbg.get('current_pm10')}")
            print(f"   previous-hour PM10   : {delhi_dbg.get('previous_hour_pm10')}")
            print(f"   previous-hour us_aqi : {delhi_dbg.get('previous_hour_us_aqi')}")
            print(f"   AQI_Lag1 (in model)  : {delhi_dbg.get('AQI_Lag1')}")
            print(f"   PM25_Roll3           : {delhi_dbg.get('PM25_Roll3')}")
            print(f"   PM10_Roll3           : {delhi_dbg.get('PM10_Roll3')}")
            assert delhi_dbg.get("AQI_Lag1") == delhi_dbg.get("previous_hour_us_aqi")
            if delhi_dbg.get("previous_hour_us_aqi") != delhi_dbg.get("previous_hour_pm25"):
                assert delhi_dbg.get("AQI_Lag1") != delhi_dbg.get("previous_hour_pm25")

        print("-> Confirmed: AQI_Lag1 is strictly equal to previous_hour_us_aqi.")
        print("-> Confirmed: AQI_Lag1 is strictly NOT previous-hour PM2.5.")
        print("-> Confirmed: PM25_Lag1 and PM10_Lag1 come from previous hour (not current).")
        print("-> Confirmed: Rolling features are mathematically accurate 3-hour means.")
        print("-> RESULT: PASS")

        # 8. Surface Pressure Check
        print("\n[TEST 8] Surface Pressure Check")
        # Ensure pressure returned in weather payload is surface_pressure
        assert "surface_pressure" in w_data
        print(f"-> Weather endpoint uses surface_pressure: {w_data['surface_pressure']}")
        print("-> RESULT: PASS")

        # 9. No Runtime final_dataset.csv Check
        print("\n[TEST 9] Confirm final_dataset.csv is NOT Loaded at Runtime")
        loaded_modules_with_csv = []
        for name, mod in list(sys.modules.items()):
            if mod and hasattr(mod, "__file__") and mod.__file__ and "ClimateGuardian-Backend" in mod.__file__:
                for attr_name in dir(mod):
                    try:
                        val = getattr(mod, attr_name)
                        if isinstance(val, str) and "final_dataset.csv" in val:
                            loaded_modules_with_csv.append((name, attr_name))
                    except Exception:
                        pass
        assert len(loaded_modules_with_csv) == 0, f"Found final_dataset in modules: {loaded_modules_with_csv}"
        print("-> Verified: Zero references to final_dataset.csv at runtime.")
        print("-> RESULT: PASS")

        # 10. Network Failure Error Handling (Simulated)
        print("\n[TEST 10] Upstream Network Failure Handling")
        with patch("app.services.aqi_service.fetch_weather", side_effect=httpx.TimeoutException("Open-Meteo connection timed out")):
            res_fail = client.get("/api/weather/current?city=Delhi")
            print(f"-> Simulated timeout GET /api/weather/current?city=Delhi status: {res_fail.status_code}")
            print(f"-> Body: {res_fail.json()}")
            assert res_fail.status_code in [502, 504, 500]
        print("-> RESULT: PASS (controlled upstream error response)")

        # 11. Health, Root, and OpenAPI Schemas
        print("\n[TEST 11] Health, Root, and OpenAPI Schemas")
        res_root = client.get("/")
        assert res_root.status_code == 200
        res_health = client.get("/api/health")
        assert res_health.status_code == 200
        res_openapi = client.get("/openapi.json")
        assert res_openapi.status_code == 200
        paths = list(res_openapi.json().get("paths", {}).keys())
        print(f"-> Registered API paths: {paths}")
        assert "/api/aqi/predict" in paths
        assert "/api/weather/current" in paths
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 11 VERIFICATION TESTS COMPLETED & PASSED   ")
    print("==================================================")

if __name__ == "__main__":
    main()
