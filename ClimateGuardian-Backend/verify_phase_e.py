"""
verify_phase_e.py
-----------------
Verification suite for Phase E — Reports & Alerts.

Tests:
  1.  Import: app, routers, services all importable without error.
  2.  Lifespan startup: XGBoost model + coordinates loaded.
  3.  GET /api/reports/metrics — schema completeness & value accuracy.
  4.  GET /api/reports/validation — 14-day holdout validation series.
  5.  GET /api/reports/feature-importance — ranking by tree gain.
  6.  GET /api/alerts — full alerts broadcast feed.
  7.  GET /api/alerts?city=Delhi — city-specific alert filtering.
  8.  GET /api/alerts?type=weather — weather advisory filtering.
  9.  GET /api/alerts?severity=poor — critical threshold filtering.
  10. GET /api/alerts?city=NonExistentCity — clean empty list response.
  11. GET /api/news/environment — environmental policy & monitoring news feed.
  12. OpenAPI schema — confirms all new routes registered.
  13. Phase B/C/D regressions — prior endpoints intact in schema.
"""

import sys
from fastapi.testclient import TestClient


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("==================================================")
    print("         PHASE E VERIFICATION TEST SUITE          ")
    print("==================================================")

    # ── TEST 1 ── Imports ───────────────────────────────────────────────────
    print("\n[TEST 1] Imports")
    from app.main import app
    from app.services.reports_service import (
        get_model_evaluation_metrics,
        get_validation_data,
        get_feature_importance_data,
    )
    from app.services.alerts_service import get_alerts, get_news
    from app.routes.reports import router as reports_router
    from app.routes.alerts import router as alerts_router

    assert reports_router is not None
    assert alerts_router is not None
    print("-> app, reports & alerts routers and services all importable")
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # ── TEST 2 ── Startup ──────────────────────────────────────────────
        print("\n[TEST 2] Startup")
        assert getattr(app.state, "model", None) is not None, "Model not loaded"
        assert getattr(app.state, "coordinates", None) is not None, "Coords not loaded"
        print("-> RESULT: PASS")

        # ── TEST 3 ── GET /api/reports/metrics ─────────────────────────────
        print("\n[TEST 3] GET /api/reports/metrics")
        r_metrics = client.get("/api/reports/metrics")
        print(f"-> Status: {r_metrics.status_code}")
        assert r_metrics.status_code == 200, f"Failed: {r_metrics.text}"
        m = r_metrics.json()
        required_metric_keys = ["r2", "mae", "rmse", "mape", "cvScore", "confidence", "n_features"]
        for k in required_metric_keys:
            assert k in m, f"Missing metric key: {k}"
        assert m["r2"] >= 0.90, f"Expected r2 >= 0.90, got {m['r2']}"
        assert m["n_features"] == 22, f"Expected 22 features, got {m['n_features']}"
        print(f"-> Model R²: {m['r2']}, MAE: {m['mae']}, RMSE: {m['rmse']}, MAPE: {m['mape']}%")
        print("-> RESULT: PASS")

        # ── TEST 4 ── GET /api/reports/validation ──────────────────────────
        print("\n[TEST 4] GET /api/reports/validation")
        r_val = client.get("/api/reports/validation")
        assert r_val.status_code == 200, f"Failed: {r_val.text}"
        val_data = r_val.json()
        assert isinstance(val_data, list), "Validation data must be a list"
        assert len(val_data) == 14, f"Expected 14 days, got {len(val_data)}"
        for item in val_data:
            assert "day" in item and "actual" in item and "predicted" in item
        print(f"-> Verified 14-day holdout series (Day 1: actual={val_data[0]['actual']}, pred={val_data[0]['predicted']})")
        print("-> RESULT: PASS")

        # ── TEST 5 ── GET /api/reports/feature-importance ──────────────────
        print("\n[TEST 5] GET /api/reports/feature-importance")
        r_fi = client.get("/api/reports/feature-importance")
        assert r_fi.status_code == 200, f"Failed: {r_fi.text}"
        fi_data = r_fi.json()
        assert isinstance(fi_data, list) and len(fi_data) >= 5
        for item in fi_data:
            assert "name" in item and "gain" in item and "category" in item
        print(f"-> Top feature: {fi_data[0]['name']} (gain={fi_data[0]['gain']}%)")
        print("-> RESULT: PASS")

        # ── TEST 6 ── GET /api/alerts ──────────────────────────────────────
        print("\n[TEST 6] GET /api/alerts (All alerts feed)")
        r_alerts = client.get("/api/alerts")
        assert r_alerts.status_code == 200, f"Failed: {r_alerts.text}"
        all_alerts = r_alerts.json()
        assert isinstance(all_alerts, list) and len(all_alerts) >= 4
        required_alert_keys = ["id", "type", "severity", "city", "message", "time"]
        for a in all_alerts:
            for k in required_alert_keys:
                assert k in a, f"Alert missing key '{k}': {a}"
        print(f"-> Returned {len(all_alerts)} active alerts across zones")
        print("-> RESULT: PASS")

        # ── TEST 7 ── GET /api/alerts?city=Delhi ───────────────────────────
        print("\n[TEST 7] GET /api/alerts?city=Delhi (Case-insensitive city filter)")
        r_delhi = client.get("/api/alerts?city=delhi")
        assert r_delhi.status_code == 200
        delhi_alerts = r_delhi.json()
        assert len(delhi_alerts) > 0, "Expected at least 1 alert for Delhi"
        for a in delhi_alerts:
            assert a["city"].lower() == "delhi"
        print(f"-> Delhi alerts ({len(delhi_alerts)}): {delhi_alerts[0]['message']}")
        print("-> RESULT: PASS")

        # ── TEST 8 ── GET /api/alerts?type=weather ─────────────────────────
        print("\n[TEST 8] GET /api/alerts?type=weather (Type filtering)")
        r_weather_alerts = client.get("/api/alerts?type=weather")
        assert r_weather_alerts.status_code == 200
        weather_alerts = r_weather_alerts.json()
        assert len(weather_alerts) > 0
        for a in weather_alerts:
            assert a["type"] == "weather"
        print(f"-> Weather advisories: {len(weather_alerts)}")
        print("-> RESULT: PASS")

        # ── TEST 9 ── GET /api/alerts?severity=poor ────────────────────────
        print("\n[TEST 9] GET /api/alerts?severity=poor (Severity filtering)")
        r_poor = client.get("/api/alerts?severity=poor")
        assert r_poor.status_code == 200
        poor_alerts = r_poor.json()
        assert len(poor_alerts) > 0
        for a in poor_alerts:
            assert a["severity"] == "poor"
        print(f"-> High severity / critical alerts: {len(poor_alerts)}")
        print("-> RESULT: PASS")

        # ── TEST 10 ── GET /api/alerts?city=NonExistentCity ─────────────────
        print("\n[TEST 10] GET /api/alerts?city=NonExistentCity (Empty result handling)")
        r_empty = client.get("/api/alerts?city=NonExistentCity")
        assert r_empty.status_code == 200
        assert r_empty.json() == []
        print("-> Gracefully returns empty list []")
        print("-> RESULT: PASS")

        # ── TEST 11 ── GET /api/news/environment ───────────────────────────
        print("\n[TEST 11] GET /api/news/environment")
        r_news = client.get("/api/news/environment")
        assert r_news.status_code == 200, f"Failed: {r_news.text}"
        news = r_news.json()
        assert isinstance(news, list) and len(news) >= 3
        for item in news:
            assert "id" in item and "title" in item and "source" in item and "time" in item
        print(f"-> Returned {len(news)} environmental news items. Latest: '{news[0]['title']}'")
        print("-> RESULT: PASS")

        # ── TEST 12 ── OpenAPI schema paths ────────────────────────────────
        print("\n[TEST 12] OpenAPI schema contains all Phase E endpoints")
        r_open = client.get("/openapi.json")
        assert r_open.status_code == 200
        paths = r_open.json().get("paths", {})
        expected_paths = [
            "/api/reports/metrics",
            "/api/reports/validation",
            "/api/reports/feature-importance",
            "/api/alerts",
            "/api/news/environment",
        ]
        for ep in expected_paths:
            assert ep in paths, f"Path {ep} missing from OpenAPI schema!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

        # ── TEST 13 ── Phase B, C, D endpoints intact ──────────────────────
        print("\n[TEST 13] Prior Phase endpoints intact")
        prior_endpoints = [
            "/api/aqi/predict",
            "/api/weather/current",
            "/api/carbon/calculate",
            "/api/carbon/factors",
            "/api/health",
        ]
        for ep in prior_endpoints:
            assert ep in paths, f"Prior endpoint {ep} missing!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 13 VERIFICATION TESTS COMPLETED & PASSED   ")
    print("==================================================")


if __name__ == "__main__":
    main()
