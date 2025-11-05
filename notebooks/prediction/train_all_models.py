"""
Loan Sales Prediction - Train All Models

This script trains multiple types of models for loan sales prediction:
1. Time Series Models: ARIMA, SARIMA, SARIMAX
2. ML Models: Ridge, Random Forest, XGBoost, LightGBM, CatBoost, etc.

All models are saved for web app deployment with dropdown selection.

Usage:
    python train_all_models.py
"""

import pandas as pd
import numpy as np
from pathlib import Path
import pickle
import json
import warnings
warnings.filterwarnings('ignore')

# ML Models
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, mean_absolute_percentage_error

# Advanced ML Models
try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("⚠️  XGBoost not installed. Install with: pip install xgboost")

try:
    from lightgbm import LGBMRegressor
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False
    print("⚠️  LightGBM not installed. Install with: pip install lightgbm")

try:
    from catboost import CatBoostRegressor
    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False
    print("⚠️  CatBoost not installed. Install with: pip install catboost")

# Time Series Models
try:
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False
    print("⚠️  Statsmodels not installed. Install with: pip install statsmodels")


def load_data(pca_path, raw_path):
    """Load both PCA and raw data"""
    print("📂 Loading data...")
    df_pca = pd.read_csv(pca_path)
    df_raw = pd.read_csv(raw_path)
    print(f"✅ PCA data: {df_pca.shape}")
    print(f"✅ Raw data: {df_raw.shape}\n")
    return df_pca, df_raw


def prepare_ml_data(df_pca, test_size=0.15, random_state=42):
    """Prepare data for ML models"""
    print("📊 Preparing ML data (PCA features)...")

    target = 'Nağd_pul_kredit_satışı'
    features = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6']

    X = df_pca[features].values
    y = df_pca[target].values

    # Time-based split (no shuffle)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, shuffle=False
    )

    print(f"   Training: {X_train.shape[0]} samples")
    print(f"   Test: {X_test.shape[0]} samples\n")

    return X_train, X_test, y_train, y_test, features


def prepare_ts_data(df_raw, target='Nağd_pul_kredit_satışı'):
    """Prepare data for time series models"""
    print("📊 Preparing time series data...")

    # Create datetime index
    df_ts = df_raw[[target, 'Year', 'Quarter']].dropna()
    df_ts['Date'] = pd.PeriodIndex(
        year=df_ts['Year'].astype(int),
        quarter=df_ts['Quarter'].astype(int),
        freq='Q'
    )
    df_ts = df_ts.set_index('Date')
    ts_data = df_ts[target]

    print(f"   Time series length: {len(ts_data)} quarters")
    print(f"   Range: {ts_data.index[0]} to {ts_data.index[-1]}\n")

    return ts_data


def train_ml_models(X_train, y_train):
    """Train all ML models"""
    print("\n" + "="*80)
    print("🤖 TRAINING ML MODELS")
    print("="*80 + "\n")

    models = {}

    # 1. Linear Models
    print("1️⃣  Linear Models...")
    models['Ridge (α=1.0)'] = Ridge(alpha=1.0, random_state=42)
    models['Ridge (α=10.0)'] = Ridge(alpha=10.0, random_state=42)
    models['Lasso (α=1.0)'] = Lasso(alpha=1.0, random_state=42, max_iter=10000)
    models['ElasticNet'] = ElasticNet(alpha=1.0, l1_ratio=0.5, random_state=42, max_iter=10000)

    # 2. Tree-based Models
    print("2️⃣  Tree-based Models...")
    models['Decision Tree'] = DecisionTreeRegressor(max_depth=5, random_state=42)
    models['Random Forest'] = RandomForestRegressor(
        n_estimators=100,
        max_depth=5,
        min_samples_split=3,
        random_state=42,
        n_jobs=-1
    )

    # 3. Boosting Models
    print("3️⃣  Boosting Models...")
    models['Gradient Boosting'] = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        random_state=42
    )
    models['AdaBoost'] = AdaBoostRegressor(
        n_estimators=100,
        learning_rate=0.1,
        random_state=42
    )

    # 4. XGBoost
    if HAS_XGBOOST:
        print("4️⃣  XGBoost...")
        models['XGBoost'] = XGBRegressor(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )

    # 5. LightGBM
    if HAS_LIGHTGBM:
        print("5️⃣  LightGBM...")
        models['LightGBM'] = LGBMRegressor(
            n_estimators=100,
            max_depth=3,
            learning_rate=0.1,
            random_state=42,
            verbosity=-1
        )

    # 6. CatBoost
    if HAS_CATBOOST:
        print("6️⃣  CatBoost...")
        models['CatBoost'] = CatBoostRegressor(
            iterations=100,
            depth=3,
            learning_rate=0.1,
            random_state=42,
            verbose=0
        )

    # 7. Other Models
    print("7️⃣  Other ML Models...")
    models['K-Nearest Neighbors'] = KNeighborsRegressor(n_neighbors=5)
    models['Support Vector Regression'] = SVR(kernel='rbf', C=1.0, epsilon=0.1)

    # Train all models
    trained_models = {}
    print("\n" + "-"*80)
    for name, model in models.items():
        print(f"Training {name}...")
        try:
            model.fit(X_train, y_train)
            trained_models[name] = model
            print(f"✅ {name} trained successfully")
        except Exception as e:
            print(f"❌ {name} failed: {str(e)}")

    print(f"\n✅ Trained {len(trained_models)}/{len(models)} ML models\n")
    return trained_models


def train_ts_models(ts_data):
    """Train time series models"""
    if not HAS_STATSMODELS:
        print("⚠️  Skipping time series models (statsmodels not installed)")
        return {}

    print("\n" + "="*80)
    print("📈 TRAINING TIME SERIES MODELS")
    print("="*80 + "\n")

    models = {}

    # Convert to numeric frequency for statsmodels
    ts_numeric = pd.Series(ts_data.values, index=range(len(ts_data)))

    # 1. ARIMA
    print("1️⃣  ARIMA Models...")
    try:
        print("   Training ARIMA(1,1,1)...")
        arima_111 = ARIMA(ts_numeric, order=(1,1,1))
        models['ARIMA(1,1,1)'] = arima_111.fit()
        print("   ✅ ARIMA(1,1,1) trained")
    except Exception as e:
        print(f"   ❌ ARIMA(1,1,1) failed: {str(e)}")

    try:
        print("   Training ARIMA(2,1,2)...")
        arima_212 = ARIMA(ts_numeric, order=(2,1,2))
        models['ARIMA(2,1,2)'] = arima_212.fit()
        print("   ✅ ARIMA(2,1,2) trained")
    except Exception as e:
        print(f"   ❌ ARIMA(2,1,2) failed: {str(e)}")

    # 2. SARIMA (seasonal ARIMA)
    print("\n2️⃣  SARIMA Models...")
    try:
        print("   Training SARIMA(1,1,1)(1,1,1,4)...")
        sarima = SARIMAX(ts_numeric, order=(1,1,1), seasonal_order=(1,1,1,4))
        models['SARIMA(1,1,1)(1,1,1,4)'] = sarima.fit(disp=False)
        print("   ✅ SARIMA trained")
    except Exception as e:
        print(f"   ❌ SARIMA failed: {str(e)}")

    # 3. SARIMAX with exogenous variables (using trend)
    print("\n3️⃣  SARIMAX Models...")
    try:
        print("   Training SARIMAX with trend...")
        exog = np.arange(len(ts_numeric)).reshape(-1, 1)
        sarimax = SARIMAX(ts_numeric, exog=exog, order=(1,1,1), seasonal_order=(1,1,1,4))
        models['SARIMAX(1,1,1)(1,1,1,4)'] = sarimax.fit(disp=False)
        print("   ✅ SARIMAX trained")
    except Exception as e:
        print(f"   ❌ SARIMAX failed: {str(e)}")

    # 4. Exponential Smoothing
    print("\n4️⃣  Exponential Smoothing...")
    try:
        print("   Training Holt-Winters...")
        hw = ExponentialSmoothing(
            ts_numeric,
            seasonal_periods=4,
            trend='add',
            seasonal='add'
        )
        models['Holt-Winters'] = hw.fit()
        print("   ✅ Holt-Winters trained")
    except Exception as e:
        print(f"   ❌ Holt-Winters failed: {str(e)}")

    print(f"\n✅ Trained {len(models)} time series models\n")
    return models


def evaluate_ml_models(models, X_train, X_test, y_train, y_test):
    """Evaluate all ML models"""
    print("\n" + "="*80)
    print("📊 EVALUATING ML MODELS")
    print("="*80 + "\n")

    results = {}

    for name, model in models.items():
        try:
            # Predictions
            y_train_pred = model.predict(X_train)
            y_test_pred = model.predict(X_test)

            # Metrics
            train_r2 = r2_score(y_train, y_train_pred)
            test_r2 = r2_score(y_test, y_test_pred)
            train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
            test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
            train_mae = mean_absolute_error(y_train, y_train_pred)
            test_mae = mean_absolute_error(y_test, y_test_pred)

            # MAPE (handle division by zero)
            train_mape = np.mean(np.abs((y_train - y_train_pred) / np.where(y_train != 0, y_train, 1))) * 100
            test_mape = np.mean(np.abs((y_test - y_test_pred) / np.where(y_test != 0, y_test, 1))) * 100

            results[name] = {
                'train_r2': train_r2,
                'test_r2': test_r2,
                'train_rmse': train_rmse,
                'test_rmse': test_rmse,
                'train_mae': train_mae,
                'test_mae': test_mae,
                'train_mape': train_mape,
                'test_mape': test_mape
            }

            print(f"{name}:")
            print(f"   Train R²: {train_r2:.4f}  |  Test R²: {test_r2:.4f}")
            print(f"   Train RMSE: {train_rmse:,.0f}  |  Test RMSE: {test_rmse:,.0f}")
            print(f"   Train MAE: {train_mae:,.0f}  |  Test MAE: {test_mae:,.0f}")
            print(f"   Train MAPE: {train_mape:.2f}%  |  Test MAPE: {test_mape:.2f}%")
            print()

        except Exception as e:
            print(f"❌ {name} evaluation failed: {str(e)}\n")

    return results


def evaluate_ts_models(models, ts_data, test_size=4):
    """Evaluate time series models"""
    if not models:
        return {}

    print("\n" + "="*80)
    print("📊 EVALUATING TIME SERIES MODELS")
    print("="*80 + "\n")

    results = {}

    # Split time series
    train_size = len(ts_data) - test_size
    train = ts_data[:train_size]
    test = ts_data[train_size:]

    # Convert to numeric
    train_numeric = pd.Series(train.values, index=range(len(train)))
    test_numeric = pd.Series(test.values, index=range(len(train), len(ts_data)))

    for name, model in models.items():
        try:
            # Get predictions
            if 'SARIMAX' in name and 'exog' in name:
                # SARIMAX with exogenous
                exog_test = np.arange(len(train), len(ts_data)).reshape(-1, 1)
                forecast = model.forecast(steps=test_size, exog=exog_test)
            else:
                forecast = model.forecast(steps=test_size)

            # Metrics
            test_r2 = r2_score(test.values, forecast)
            test_rmse = np.sqrt(mean_squared_error(test.values, forecast))
            test_mae = mean_absolute_error(test.values, forecast)
            test_mape = np.mean(np.abs((test.values - forecast) / np.where(test.values != 0, test.values, 1))) * 100

            results[name] = {
                'test_r2': test_r2,
                'test_rmse': test_rmse,
                'test_mae': test_mae,
                'test_mape': test_mape
            }

            print(f"{name}:")
            print(f"   Test R²: {test_r2:.4f}")
            print(f"   Test RMSE: {test_rmse:,.0f}")
            print(f"   Test MAE: {test_mae:,.0f}")
            print(f"   Test MAPE: {test_mape:.2f}%")
            print()

        except Exception as e:
            print(f"❌ {name} evaluation failed: {str(e)}\n")

    return results


def save_all_models(ml_models, ts_models, ml_results, ts_results, output_dir='models'):
    """Save all models and create model registry"""
    print("\n" + "="*80)
    print("💾 SAVING ALL MODELS")
    print("="*80 + "\n")

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    model_registry = {
        'ml_models': {},
        'ts_models': {},
        'metadata': {
            'total_models': len(ml_models) + len(ts_models),
            'ml_models_count': len(ml_models),
            'ts_models_count': len(ts_models)
        }
    }

    # Save ML models
    print("1️⃣  Saving ML models...")
    for name, model in ml_models.items():
        # Create safe filename
        safe_name = name.replace(' ', '_').replace('(', '').replace(')', '').replace('.', '')
        filename = f'ml_{safe_name}.pkl'
        filepath = output_path / filename

        with open(filepath, 'wb') as f:
            pickle.dump(model, f)

        model_registry['ml_models'][name] = {
            'filename': filename,
            'type': 'ml',
            'metrics': ml_results.get(name, {})
        }
        print(f"   ✅ {name} → {filename}")

    # Save time series models
    print("\n2️⃣  Saving time series models...")
    for name, model in ts_models.items():
        safe_name = name.replace(' ', '_').replace('(', '').replace(')', '').replace(',', '')
        filename = f'ts_{safe_name}.pkl'
        filepath = output_path / filename

        with open(filepath, 'wb') as f:
            pickle.dump(model, f)

        model_registry['ts_models'][name] = {
            'filename': filename,
            'type': 'timeseries',
            'metrics': ts_results.get(name, {})
        }
        print(f"   ✅ {name} → {filename}")

    # Save model registry
    registry_path = output_path / 'model_registry.json'
    with open(registry_path, 'w', encoding='utf-8') as f:
        json.dump(model_registry, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Model registry saved: {registry_path}")
    print(f"\n📦 Total: {len(ml_models)} ML models + {len(ts_models)} TS models = {len(ml_models) + len(ts_models)} models")


def create_summary_report(ml_results, ts_results, output_dir='models'):
    """Create performance summary report"""
    print("\n" + "="*80)
    print("📄 CREATING SUMMARY REPORT")
    print("="*80 + "\n")

    report = []
    report.append("# Model Performance Summary\n")
    report.append(f"**Date:** {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

    # ML Models Summary
    report.append("## Machine Learning Models\n\n")
    if ml_results:
        # Sort by test R²
        sorted_ml = sorted(ml_results.items(), key=lambda x: x[1].get('test_r2', -999), reverse=True)

        report.append("| Model | Test R² | Test RMSE | Test MAE | Test MAPE |\n")
        report.append("|-------|---------|-----------|----------|----------|\n")

        for name, metrics in sorted_ml:
            report.append(f"| {name} | {metrics.get('test_r2', 0):.4f} | "
                        f"{metrics.get('test_rmse', 0):,.0f} | "
                        f"{metrics.get('test_mae', 0):,.0f} | "
                        f"{metrics.get('test_mape', 0):.2f}% |\n")

        # Best model
        best_ml = sorted_ml[0]
        report.append(f"\n**Best ML Model:** {best_ml[0]} (Test R² = {best_ml[1]['test_r2']:.4f})\n\n")

    # Time Series Models Summary
    report.append("## Time Series Models\n\n")
    if ts_results:
        sorted_ts = sorted(ts_results.items(), key=lambda x: x[1].get('test_r2', -999), reverse=True)

        report.append("| Model | Test R² | Test RMSE | Test MAE | Test MAPE |\n")
        report.append("|-------|---------|-----------|----------|----------|\n")

        for name, metrics in sorted_ts:
            report.append(f"| {name} | {metrics.get('test_r2', 0):.4f} | "
                        f"{metrics.get('test_rmse', 0):,.0f} | "
                        f"{metrics.get('test_mae', 0):,.0f} | "
                        f"{metrics.get('test_mape', 0):.2f}% |\n")

        # Best model
        best_ts = sorted_ts[0]
        report.append(f"\n**Best TS Model:** {best_ts[0]} (Test R² = {best_ts[1]['test_r2']:.4f})\n\n")

    # Save report
    report_path = Path(output_dir) / 'MODELS_SUMMARY.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.writelines(report)

    print(f"✅ Summary report saved: {report_path}")


def main():
    """Main execution"""
    print("\n" + "="*80)
    print("TRAIN ALL MODELS - LOAN SALES PREDICTION")
    print("="*80 + "\n")

    # Paths
    PCA_PATH = Path('data/pca_features.csv')
    RAW_PATH = Path('data/ml_ready_data.csv')
    MODEL_DIR = Path('models')

    try:
        # 1. Load data
        df_pca, df_raw = load_data(PCA_PATH, RAW_PATH)

        # 2. Prepare ML data
        X_train, X_test, y_train, y_test, features = prepare_ml_data(df_pca)

        # 3. Prepare time series data
        ts_data = prepare_ts_data(df_raw)

        # 4. Train ML models
        ml_models = train_ml_models(X_train, y_train)

        # 5. Train time series models
        ts_models = train_ts_models(ts_data)

        # 6. Evaluate ML models
        ml_results = evaluate_ml_models(ml_models, X_train, X_test, y_train, y_test)

        # 7. Evaluate time series models
        ts_results = evaluate_ts_models(ts_models, ts_data)

        # 8. Save all models
        save_all_models(ml_models, ts_models, ml_results, ts_results, MODEL_DIR)

        # 9. Create summary report
        create_summary_report(ml_results, ts_results, MODEL_DIR)

        print("\n" + "="*80)
        print("✅ ALL MODELS TRAINED AND SAVED")
        print("="*80)
        print(f"\n📊 Total: {len(ml_models)} ML + {len(ts_models)} TS = {len(ml_models) + len(ts_models)} models")
        print(f"📁 Saved to: {MODEL_DIR.absolute()}")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
