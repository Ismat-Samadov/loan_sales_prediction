#!/usr/bin/env python3
"""
Test all 18 models systematically
"""
import requests
import json
import time

BASE_URL = "http://localhost:8001"

# All 18 models from registry
ML_MODELS = [
    "Ridge (α=1.0)",
    "Ridge (α=10.0)",
    "Lasso (α=1.0)",
    "ElasticNet",
    "Decision Tree",
    "Random Forest",
    "Gradient Boosting",
    "AdaBoost",
    "XGBoost",
    "LightGBM",
    "CatBoost",
    "K-Nearest Neighbors",
    "Support Vector Regression"
]

TS_MODELS = [
    "ARIMA(1,1,1)",
    "ARIMA(2,1,2)",
    "SARIMA(1,1,1)(1,1,1,4)",
    "SARIMAX(1,1,1)(1,1,1,4)",
    "Holt-Winters"
]

def test_model(model_name, year=2025, quarter=1):
    """Test a single model"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/predict",
            json={"model": model_name, "year": year, "quarter": quarter},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                prediction = data.get('prediction', 0)
                print(f"✅ {model_name:35} | Prediction: {prediction:,.2f}")
                return True, None
            else:
                error = data.get('error', 'Unknown error')
                print(f"❌ {model_name:35} | Error: {error}")
                return False, error
        else:
            error_text = response.text
            print(f"❌ {model_name:35} | HTTP {response.status_code}: {error_text[:100]}")
            return False, error_text

    except Exception as e:
        print(f"❌ {model_name:35} | Exception: {str(e)}")
        return False, str(e)

def main():
    print("=" * 80)
    print("TESTING ALL 18 MODELS")
    print("=" * 80)

    # Test health first
    print("\n🔍 Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"Status: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return

    # Test ML models
    print("\n" + "=" * 80)
    print("TESTING ML MODELS (13 models)")
    print("=" * 80)

    ml_results = []
    for model in ML_MODELS:
        success, error = test_model(model)
        ml_results.append((model, success, error))
        time.sleep(0.5)  # Small delay between requests

    # Test TS models
    print("\n" + "=" * 80)
    print("TESTING TIME SERIES MODELS (5 models)")
    print("=" * 80)

    ts_results = []
    for model in TS_MODELS:
        success, error = test_model(model)
        ts_results.append((model, success, error))
        time.sleep(0.5)

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    ml_success = sum(1 for _, success, _ in ml_results if success)
    ts_success = sum(1 for _, success, _ in ts_results if success)
    total_success = ml_success + ts_success

    print(f"\n✅ ML Models Passed: {ml_success}/{len(ML_MODELS)}")
    print(f"✅ TS Models Passed: {ts_success}/{len(TS_MODELS)}")
    print(f"✅ Total Passed: {total_success}/18")

    # Print failures
    all_results = ml_results + ts_results
    failures = [(model, error) for model, success, error in all_results if not success]

    if failures:
        print("\n" + "=" * 80)
        print("FAILURES TO FIX")
        print("=" * 80)
        for model, error in failures:
            print(f"\n❌ {model}")
            print(f"   Error: {error}")
    else:
        print("\n🎉 ALL 18 MODELS WORKING PERFECTLY!")

    return len(failures) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
