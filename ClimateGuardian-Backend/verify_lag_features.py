import sys
import pandas as pd
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app

def main():
    print("==================================================================")
    print("      CRITICAL LAG FEATURE & MODEL DATAFRAME VERIFICATION         ")
    print("==================================================================")

    # 1. Verification with Live Open-Meteo Telemetry via intercepted model.predict
    captured_dfs = []

    with TestClient(app) as client:
        real_model = app.state.model
        orig_predict = real_model.predict

        def mock_predict(df, *args, **kwargs):
            captured_dfs.append(df.copy())
            return orig_predict(df, *args, **kwargs)

        real_model.predict = mock_predict

        try:
            print("\n[PART 1] Executing Live Prediction for Delhi...")
            res = client.get("/api/aqi/predict?city=Delhi")
            assert res.status_code == 200, f"Predict failed: {res.text}"
            data = res.json()
        finally:
            real_model.predict = orig_predict

        assert len(captured_dfs) > 0, "No DataFrame captured by model.predict!"
        model_input_df: pd.DataFrame = captured_dfs[0]

        # 2. Check canonical 22-feature order in actual DataFrame passed to model
        canonical_features = [
            "PM2.5", "PM10", "CO", "NO2", "SO2", "Ozone",
            "Temperature", "Humidity", "Pressure", "WindSpeed", "Rain", "WeatherCode",
            "Hour", "Day", "Month", "DayOfWeek", "IsWeekend",
            "AQI_Lag1", "PM25_Lag1", "PM10_Lag1", "PM25_Roll3", "PM10_Roll3"
        ]
        actual_columns = list(model_input_df.columns)
        print("\n[PART 2] Actual DataFrame Columns Passed to model.predict():")
        for i, col in enumerate(actual_columns, 1):
            print(f"  {i:2d}. {col}")

        assert actual_columns == canonical_features, (
            f"Column order mismatch!\nActual: {actual_columns}\nExpected: {canonical_features}"
        )
        print("-> Column order matches canonical 22 features EXACTLY.")

        # 3. Print actual values used in model input
        debug_info = data.get("telemetry_debug", {})
        row = model_input_df.iloc[0]

        current_pm25 = row["PM2.5"]
        prev_pm25 = debug_info.get("previous_hour_pm25")
        current_pm10 = row["PM10"]
        prev_pm10 = debug_info.get("previous_hour_pm10")
        prev_us_aqi = debug_info.get("previous_hour_us_aqi")
        aqi_lag1 = row["AQI_Lag1"]
        pm25_lag1 = row["PM25_Lag1"]
        pm10_lag1 = row["PM10_Lag1"]
        pm25_roll3 = row["PM25_Roll3"]
        pm10_roll3 = row["PM10_Roll3"]

        print("\n[PART 3] Actual Values Used in Model Input:")
        print(f"  * current PM2.5        : {current_pm25}")
        print(f"  * previous-hour PM2.5  : {prev_pm25}")
        print(f"  * current PM10         : {current_pm10}")
        print(f"  * previous-hour PM10   : {prev_pm10}")
        print(f"  * previous-hour us_aqi : {prev_us_aqi}")
        print(f"  * AQI_Lag1 (in model)  : {aqi_lag1}")
        print(f"  * PM25_Lag1 (in model) : {pm25_lag1}")
        print(f"  * PM10_Lag1 (in model) : {pm10_lag1}")
        print(f"  * PM25_Roll3           : {pm25_roll3}")
        print(f"  * PM10_Roll3           : {pm10_roll3}")

        # 4. Explicit verification of equality and inequality
        print("\n[PART 4] Explicit Assertions:")
        print(f"  Checking: AQI_Lag1 ({aqi_lag1}) == previous_hour_us_aqi ({prev_us_aqi})")
        assert aqi_lag1 == prev_us_aqi, (
            f"VIOLATION: AQI_Lag1 ({aqi_lag1}) != previous_hour_us_aqi ({prev_us_aqi})"
        )
        print("  -> PASS: AQI_Lag1 is strictly equal to previous_hour_us_aqi.")

        print(f"  Checking: PM25_Lag1 ({pm25_lag1}) == previous_hour_pm25 ({prev_pm25})")
        assert pm25_lag1 == prev_pm25, (
            f"VIOLATION: PM25_Lag1 ({pm25_lag1}) != previous_hour_pm25 ({prev_pm25})"
        )
        print("  -> PASS: PM25_Lag1 is strictly equal to previous_hour_pm25.")

        print(f"  Checking: PM10_Lag1 ({pm10_lag1}) == previous_hour_pm10 ({prev_pm10})")
        assert pm10_lag1 == prev_pm10, (
            f"VIOLATION: PM10_Lag1 ({pm10_lag1}) != previous_hour_pm10 ({prev_pm10})"
        )
        print("  -> PASS: PM10_Lag1 is strictly equal to previous_hour_pm10.")

        if prev_us_aqi != prev_pm25:
            print(f"  Checking: AQI_Lag1 ({aqi_lag1}) != previous_hour_pm25 ({prev_pm25})")
            assert aqi_lag1 != prev_pm25, (
                f"CRITICAL VIOLATION: AQI_Lag1 ({aqi_lag1}) was wrongly set to previous-hour PM2.5!"
            )
            print("  -> PASS: AQI_Lag1 is strictly NOT previous-hour PM2.5.")
        else:
            print("  (Note: previous_hour_us_aqi coincidentally equals previous_hour_pm25 in live data; tested in synthetic test below)")

    # 5. Synthetic Telemetry Test with distinct values
    print("\n[PART 5] Synthetic Telemetry Assertion Test (Distinct Values)")
    from app.services.aqi_service import compute_lag_and_rolling_features
    mock_hourly = {
        "time": ["2026-09-16T18:00", "2026-09-16T19:00", "2026-09-16T20:00", "2026-09-16T21:00"],
        "us_aqi": [180.0, 195.0, 210.0, 225.0],
        "pm2_5": [45.0, 52.0, 68.0, 75.0],
        "pm10": [85.0, 92.0, 110.0, 125.0]
    }
    synth_res = compute_lag_and_rolling_features(mock_hourly, "2026-09-16T21:00")
    print("  Mock target time: 21:00")
    print(f"  Preceding hour 20:00 us_aqi = {mock_hourly['us_aqi'][2]}")
    print(f"  Preceding hour 20:00 pm2_5  = {mock_hourly['pm2_5'][2]}")
    print(f"  Computed AQI_Lag1           = {synth_res['AQI_Lag1']}")
    print(f"  Computed PM25_Lag1          = {synth_res['PM25_Lag1']}")
    print(f"  Computed PM10_Lag1          = {synth_res['PM10_Lag1']}")
    print(f"  Computed PM25_Roll3         = {synth_res['PM25_Roll3']} (mean of 52.0, 68.0, 75.0 = 65.0)")
    print(f"  Computed PM10_Roll3         = {synth_res['PM10_Roll3']} (mean of 92.0, 110.0, 125.0 = 109.0)")

    assert synth_res["AQI_Lag1"] == 210.0, f"Expected 210.0, got {synth_res['AQI_Lag1']}"
    assert synth_res["PM25_Lag1"] == 68.0, f"Expected 68.0, got {synth_res['PM25_Lag1']}"
    assert synth_res["PM10_Lag1"] == 110.0, f"Expected 110.0, got {synth_res['PM10_Lag1']}"
    assert synth_res["PM25_Roll3"] == 65.0, f"Expected 65.0, got {synth_res['PM25_Roll3']}"
    assert synth_res["PM10_Roll3"] == 109.0, f"Expected 109.0, got {synth_res['PM10_Roll3']}"

    assert synth_res["AQI_Lag1"] == synth_res["previous_hour_us_aqi"]
    assert synth_res["AQI_Lag1"] != synth_res["previous_hour_pm25"]
    assert synth_res["AQI_Lag1"] != synth_res["current_pm25"]

    print("  -> PASS: Verified AQI_Lag1 == previous_hour_us_aqi (210.0)")
    print("  -> PASS: Verified AQI_Lag1 != previous_hour_pm25 (210.0 != 68.0)")
    print("  -> PASS: Verified AQI_Lag1 != current_pm25 (210.0 != 75.0)")

    print("\n==================================================================")
    print("     ALL LAG FEATURE & MODEL DATAFRAME ASSERTIONS PASSED!         ")
    print("==================================================================")

if __name__ == "__main__":
    main()
