"""
verify_phase_h.py
-----------------
Verification suite for Phase H — AI / Gemini Environmental Assistant.

Tests:
  1.  Import: app, ai router, and ai service.
  2.  Lifespan startup: model + coordinates loaded.
  3.  GET /api/ai/insight?city=Delhi — structured ambient health insight.
  4.  GET /api/ai/insight?city=Mumbai&aqi=45 — Good AQI range synthesis.
  5.  GET /api/ai/insight?city=Patna&aqi=350 — Critical/Very Poor alert synthesis.
  6.  POST /api/ai/chat — outdoor mask inquiry.
  7.  POST /api/ai/chat — cardio exercise timing inquiry.
  8.  POST /api/ai/chat — household carbon reduction tips.
  9.  POST /api/ai/chat — validation on empty message (422).
  10. OpenAPI schema — confirms /api/ai/insight and /api/ai/chat registered.
  11. Prior Phase endpoints intact — confirms no regressions.
"""

import sys
from fastapi.testclient import TestClient


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print("==================================================")
    print("         PHASE H VERIFICATION TEST SUITE          ")
    print("==================================================")

    # ── TEST 1 ── Imports ───────────────────────────────────────────────────
    print("\n[TEST 1] Imports")
    from app.main import app
    from app.services.ai_service import generate_ai_insight, generate_chat_response
    from app.routes.ai import router as ai_router

    assert ai_router is not None
    print("-> app, ai router, and ai service importable")
    print("-> RESULT: PASS")

    with TestClient(app) as client:
        # ── TEST 2 ── Startup ──────────────────────────────────────────────
        print("\n[TEST 2] Startup")
        assert getattr(app.state, "model", None) is not None, "Model not loaded"
        assert getattr(app.state, "coordinates", None) is not None, "Coords not loaded"
        print("-> RESULT: PASS")

        # ── TEST 3 ── GET /api/ai/insight?city=Delhi ───────────────────────
        print("\n[TEST 3] GET /api/ai/insight?city=Delhi")
        r_delhi = client.get("/api/ai/insight?city=Delhi")
        assert r_delhi.status_code == 200, f"Failed: {r_delhi.text}"
        d_data = r_delhi.json()
        required_keys = ["city", "aqi", "primary_pollutant", "headline", "insight", "recommendation", "confidence", "engine"]
        for k in required_keys:
            assert k in d_data, f"Missing key '{k}'"
        assert d_data["confidence"] >= 0.8
        print(f"-> Headline: {d_data['headline']}")
        print(f"-> Insight: {d_data['insight']}")
        print(f"-> Recommendation: {d_data['recommendation']}")
        print(f"-> Engine: {d_data['engine']} (confidence: {d_data['confidence'] * 100:.0f}%)")
        print("-> RESULT: PASS")

        # ── TEST 4 ── Good AQI range synthesis ─────────────────────────────
        print("\n[TEST 4] GET /api/ai/insight?city=Bengaluru&aqi=45 (Good AQI)")
        r_good = client.get("/api/ai/insight?city=Bengaluru&aqi=45")
        assert r_good.status_code == 200
        g_data = r_good.json()
        assert "Good" in g_data["insight"] or "Excellent" in g_data["headline"]
        print(f"-> Good condition insight: {g_data['headline']}")
        print("-> RESULT: PASS")

        # ── TEST 5 ── Critical AQI alert synthesis ─────────────────────────
        print("\n[TEST 5] GET /api/ai/insight?city=Patna&aqi=350 (Very Poor AQI)")
        r_bad = client.get("/api/ai/insight?city=Patna&aqi=350")
        assert r_bad.status_code == 200
        b_data = r_bad.json()
        assert "Poor" in b_data["headline"] or "Alert" in b_data["headline"]
        print(f"-> High severity alert: {b_data['headline']}")
        print("-> RESULT: PASS")

        # ── TEST 6 ── POST /api/ai/chat (Mask Inquiry) ──────────────────────
        print("\n[TEST 6] POST /api/ai/chat (Mask inquiry)")
        r_mask = client.post("/api/ai/chat", json={"message": "Do I need to wear a mask in Delhi today?", "city": "Delhi"})
        assert r_mask.status_code == 200, f"Failed: {r_mask.text}"
        m_reply = r_mask.json()
        assert "response" in m_reply and "N95" in m_reply["response"]
        print(f"-> Mask advice: {m_reply['response'][:120]}...")
        print("-> RESULT: PASS")

        # ── TEST 7 ── POST /api/ai/chat (Exercise Inquiry) ──────────────────
        print("\n[TEST 7] POST /api/ai/chat (Cardio exercise inquiry)")
        r_ex = client.post("/api/ai/chat", json={"message": "Can I go for an outdoor morning run?", "city": "Delhi"})
        assert r_ex.status_code == 200
        ex_reply = r_ex.json()
        assert "exercise" in ex_reply["response"].lower() or "run" in ex_reply["response"].lower() or "workout" in ex_reply["response"].lower()
        print(f"-> Exercise advice: {ex_reply['response'][:120]}...")
        print("-> RESULT: PASS")

        # ── TEST 8 ── POST /api/ai/chat (Carbon Footprint Inquiry) ──────────
        print("\n[TEST 8] POST /api/ai/chat (Carbon footprint tips)")
        r_carb = client.post("/api/ai/chat", json={"message": "How can I reduce my household carbon footprint?", "city": "Delhi"})
        assert r_carb.status_code == 200
        carb_reply = r_carb.json()
        assert "carbon" in carb_reply["response"].lower() or "emission" in carb_reply["response"].lower()
        print(f"-> Carbon advice: {carb_reply['response'][:120]}...")
        print("-> RESULT: PASS")

        # ── TEST 9 ── Validation: Empty message -> 422 ──────────────────────
        print("\n[TEST 9] POST /api/ai/chat (Empty message validation -> 422)")
        r_invalid = client.post("/api/ai/chat", json={"message": ""})
        assert r_invalid.status_code == 422
        print("-> Rejection status 422 on empty string")
        print("-> RESULT: PASS")

        # ── TEST 10 ── OpenAPI schema paths ────────────────────────────────
        print("\n[TEST 10] OpenAPI schema contains all Phase H endpoints")
        r_open = client.get("/openapi.json")
        assert r_open.status_code == 200
        paths = r_open.json().get("paths", {})
        expected_paths = [
            "/api/ai/insight",
            "/api/ai/chat",
        ]
        for ep in expected_paths:
            assert ep in paths, f"Path {ep} missing from OpenAPI schema!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

        # ── TEST 11 ── Prior Phase endpoints intact ────────────────────────
        print("\n[TEST 11] Prior Phase endpoints intact")
        prior_endpoints = [
            "/api/aqi/predict",
            "/api/weather/current",
            "/api/carbon/calculate",
            "/api/reports/metrics",
            "/api/alerts",
            "/api/insights",
            "/api/auth/login",
            "/api/health",
        ]
        for ep in prior_endpoints:
            assert ep in paths, f"Prior endpoint {ep} missing!"
            print(f"   ✓ {ep}")
        print("-> RESULT: PASS")

    print("\n==================================================")
    print("   ALL 11 VERIFICATION TESTS COMPLETED & PASSED   ")
    print("==================================================")


if __name__ == "__main__":
    main()
