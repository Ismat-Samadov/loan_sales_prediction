# 🎯 Advanced Forecasting Models

Bu folder-də kredit satışı üçün 5 müxtəlif forecasting model hazırlanır və saxlanılır.

## 📚 Models

### 1. **Random Forest** 🌲
- **Type**: Machine Learning (Ensemble)
- **Xüsusiyyəti**: Çoxlu decision tree-lərin ortalaması
- **Features**: Time-based, lag features, rolling statistics
- **Validation**: 5-fold Time Series CV + Grid Search
- **Avantajları**: Robust, az overfitting, feature importance

### 2. **XGBoost** 🚀
- **Type**: Machine Learning (Gradient Boosting)
- **Xüsusiyyəti**: Ardıcıl ağaclarla xətaları azaldır
- **Features**: Eyni Random Forest ilə
- **Validation**: 5-fold Time Series CV + Grid Search
- **Avantajları**: Yüksək accuracy, sürətli training

### 3. **ARIMA** 📈
- **Type**: Time Series (Statistical)
- **Xüsusiyyəti**: AutoRegressive Integrated Moving Average
- **Features**: Yalnız keçmiş dəyərlər (univariate)
- **Validation**: Grid Search for (p, d, q) orders
- **Avantajları**: Klassik, başa düşülən, interpretable

### 4. **SARIMA** 🌊
- **Type**: Time Series (Statistical with Seasonality)
- **Xüsusiyyəti**: ARIMA + Seasonal component
- **Features**: Quarterly seasonality (m=4)
- **Validation**: Grid Search for (p,d,q) × (P,D,Q,m)
- **Avantajları**: Mövsümilik nümunələrini tutur

### 5. **SARIMAX** 🎯
- **Type**: Time Series (Statistical with Exogenous Variables)
- **Xüsusiyyəti**: SARIMA + External variables
- **Features**: Year, Quarter (exogenous)
- **Validation**: SARIMA parameters + Exog variables
- **Avantajları**: Ən comprehensive model

## 🔧 Installation

```bash
# Required packages
pip install pandas numpy matplotlib seaborn
pip install scikit-learn xgboost
pip install statsmodels
pip install jupyter
```

## 🚀 Usage

### 1. Notebook-u run edin:

```bash
cd notebooks/predictions
jupyter notebook advanced_forecasting_models.ipynb
```

### 2. Bütün cell-ləri run edin (Cell > Run All)

### 3. Nəticələr:

Models folder-də aşağıdakılar yaranacaq:

```
models/
├── random_forest.pkl          # Random Forest model
├── xgboost.pkl                # XGBoost model
├── arima.pkl                  # ARIMA model
├── sarima.pkl                 # SARIMA model
├── sarimax.pkl                # SARIMAX model
├── scaler.pkl                 # Feature scaler
├── rf_feature_importance.csv  # RF feature importance
├── rf_feature_importance.png  # RF chart
├── xgb_feature_importance.csv # XGBoost feature importance
├── xgb_feature_importance.png # XGBoost chart
├── model_comparison.png       # Bütün modellərin müqayisəsi
├── model_metrics.json         # Detailed metrics
├── model_info.json            # Frontend üçün info
└── sample_forecasts.csv       # Növbəti 4 rüb proqnozları
```

## 📊 Performance Metrics

Hər model üçün aşağıdakı metrikalar hesablanır:

- **MAE** (Mean Absolute Error) - Ortalama mütləq xəta ↓
- **RMSE** (Root Mean Squared Error) - Kök ortalama kvadrat xəta ↓
- **R²** (R-squared) - Modelin izahedici gücü ↑
- **MAPE** (Mean Absolute Percentage Error) - Faiz xətası ↓

## 🛡️ Overfitting Prevention

1. **Time Series Split**: Chronological train-test split (random YOXDUR!)
2. **Cross-Validation**: TimeSeriesSplit with 5 folds
3. **Regularization**:
   - Random Forest: max_depth, min_samples_split, min_samples_leaf
   - XGBoost: learning_rate, subsample, colsample_bytree, gamma
4. **Monitoring**: Train vs Test metrics comparison

## 🎯 Feature Engineering

### Created Features:
- **Time Index**: Sequential numbering
- **Seasonal Encoding**: Sin/Cos transforms for Quarter
- **Lag Features**: 1, 2, 3, 4 periods ago
- **Rolling Statistics**: Mean & Std for 2, 3, 4 period windows
- **Difference Features**: 1st and 4th order differences

## 📈 Frontend Integration

### Model Selection API:

```python
# Backend endpoint (create in FastAPI)
@router.post("/predictions/forecast")
async def forecast_with_model(
    model_name: str,  # 'random_forest', 'xgboost', 'arima', 'sarima', 'sarimax'
    n_periods: int = 4
):
    # Load model
    # Make predictions
    # Return results
```

### Frontend Dropdown:

```javascript
const models = [
  { id: 'random_forest', name: 'Random Forest', type: 'ML' },
  { id: 'xgboost', name: 'XGBoost', type: 'ML' },
  { id: 'arima', name: 'ARIMA', type: 'Time Series' },
  { id: 'sarima', name: 'SARIMA', type: 'Time Series' },
  { id: 'sarimax', name: 'SARIMAX', type: 'Time Series' }
];

// User selects model
const selectedModel = 'xgboost';
const forecast = await getForecast(selectedModel, 4);
```

## 🔍 Model Comparison

Notebook avtomatik olaraq bütün modelləri müqayisə edir və ən yaxşısını seçir (MAE əsasında).

## 📚 References

- **Random Forest**: Breiman (2001)
- **XGBoost**: Chen & Guestrin (2016)
- **ARIMA**: Box & Jenkins (1970)
- **SARIMA/SARIMAX**: Extension of ARIMA

## ⚠️ Important Notes

1. **Data Leakage**: Heç vaxt future data-dan train məlumatlarına leak yoxdur
2. **Chronological Split**: Random split YOX, time-based split VAR
3. **Scaling**: Scaler yalnız train data-da fit edilir
4. **Recursive Forecasting**: Multi-step ahead üçün recursive method

## 🎓 Best Practices

1. ✅ Always use TimeSeriesSplit for time series data
2. ✅ Monitor train vs test metrics for overfitting
3. ✅ Use cross-validation for hyperparameter tuning
4. ✅ Save all artifacts (models, scalers, metrics)
5. ✅ Document feature engineering steps
6. ✅ Compare multiple models before selecting
7. ✅ Create reproducible notebooks

## 📞 Support

Issues və ya suallar üçün:
- Notebook-dakı markdown cell-ləri oxuyun
- Model metrics JSON file-ı yoxlayın
- Comparison chart-a baxın

---

**Created**: 2025-01-03
**Version**: 1.0
**Status**: Production Ready ✅
