# Loan Sales Prediction - ML Model (PCA-Based)

## Model Summary

**Model Type:** Ridge Regression (Moderate Regularization, α=1.0)

**Training Date:** 2025-11-05

**Purpose:** Predict quarterly loan sales (Nağd_pul_kredit_satışı) using PCA-transformed features

**Feature Engineering:** Principal Component Analysis (PCA)

---

## Performance Metrics

### Training Performance
- **R² Score:** 0.8879
- **RMSE:** 9,950,238 AZN
- **MAE:** 8,014,925 AZN

### Test Performance
- **R² Score:** 0.3734
- **RMSE:** 10,048,265 AZN
- **MAE:** 7,975,940 AZN

### Performance Improvement vs Manual Features
- ✅ **Test R² improved:** 0.1611 → 0.3734 (+131% improvement)
- ✅ **Fewer features:** 14 → 6 (57% reduction)
- ✅ **Eliminated multicollinearity:** VIF was infinite → PCA components uncorrelated
- ✅ **Better generalization:** More stable test performance

### Note on Performance
- Small dataset (22 samples) still limits generalization
- PCA reduces overfitting risk by eliminating multicollinearity
- Ridge Regression with moderate regularization (α=1.0) works better with uncorrelated features
- Model is suitable for trend analysis and predictions

---

## Features Used (6 PCA Components)

**Original Features:** 28 numeric features reduced to 6 PCA components

### PC1 (48.41% variance) - "Economic Scale"
- Bank deposits (loading: 0.2654)
- Population income (0.2639)
- Portfolio size (0.2637)
- Money supply (0.2606)
- Consumer spending (0.2588)

**Interpretation:** Overall economic size and banking sector scale

### PC2 (23.16% variance) - "Profitability & Trade"
- ROA (+0.3555)
- ROE (+0.3484)
- Net Interest Margin (+0.3458)
- Exports (+0.3026)

**Interpretation:** Bank profitability and export performance

### PC3 (12.79% variance) - "Seasonality & Construction"
- Quarter (-0.4354)
- Construction spending (-0.3652)
- Government spending (-0.2842)

**Interpretation:** Seasonal patterns and construction investment

### PC4 (5.73% variance) - "Seasonal Risk"
- Quarter_Sin (+0.4721)
- Quarter_Cos (+0.4462)
- NPLs (-0.3312)

**Interpretation:** Seasonal variation in credit risk

### PC5 (3.60% variance) - "Interest Rate Policy"
- Interest rate (+0.6239)
- Housing investment (-0.3739)

**Interpretation:** Monetary policy and housing investment

### PC6 (1.51% variance) - Residual variance

**Total Variance Preserved:** 95.21%

---

## Why PCA Was Used

### Problems with Original Features
1. ❌ **Severe Multicollinearity:** VIF was infinite for many features
2. ❌ **Too Many Features:** 28 features for 22 samples (1.3:1 ratio)
3. ❌ **Overfitting Risk:** Complex models showed negative test R²
4. ❌ **Poor Generalization:** Manual features gave Test R² = 0.1611

### Benefits of PCA
1. ✅ **Eliminates Multicollinearity:** Components are uncorrelated by design
2. ✅ **Reduces Dimensionality:** 6 features for 22 samples (3.7:1 ratio)
3. ✅ **Preserves Information:** 95.21% of variance retained
4. ✅ **Better Generalization:** Test R² improved to 0.3734
5. ✅ **Computational Efficiency:** Faster training with fewer features

---

## Model Files

1. **loan_sales_model.pkl** - Trained Ridge Regression model
2. **scaler.pkl** - Identity scaler (PCA features already normalized)
3. **model_metadata.json** - Model configuration and metrics

---

## Usage Example

**Important:** This model uses PCA features. You must first transform raw features using PCA.

### Option 1: Use Pre-computed PCA Features
```python
import pickle
import pandas as pd

# Load model
with open('models/loan_sales_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Load PCA features dataset
df_pca = pd.read_csv('data/pca_features.csv')

# Get features for prediction (example: last row)
X_new = df_pca[['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6']].iloc[-1:].values

# Predict (PCA features are already normalized)
prediction = model.predict(X_new)[0]
print(f"Predicted Loan Sales: {prediction:,.2f} AZN")
```

### Option 2: Transform Raw Features to PCA
```python
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# Load model
with open('models/loan_sales_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Prepare raw features (28 features)
raw_data = pd.read_csv('data/ml_ready_data.csv')

# Exclude target and leakage features
exclude_cols = ['Nağd_pul_kredit_satışı', 'Kumulyativ_satish', 'Rüblər', 'Time_Index', 'NPL_percentage']
feature_cols = [col for col in raw_data.select_dtypes(include=[np.number]).columns
                if col not in exclude_cols]

# Get features
X_raw = raw_data[feature_cols].iloc[-1:].values

# Standardize
scaler = StandardScaler()
scaler.fit(raw_data[feature_cols].dropna())
X_scaled = scaler.transform(X_raw)

# Apply PCA (must retrain PCA on historical data first)
pca = PCA(n_components=6)
pca.fit(scaler.transform(raw_data[feature_cols].dropna()))
X_pca = pca.transform(X_scaled)

# Predict
prediction = model.predict(X_pca)[0]
print(f"Predicted Loan Sales: {prediction:,.2f} AZN")
```

### Recommended: Use Feature Engineering Script
```python
# Generate PCA features from raw data
!python feature_engineering.py

# Load PCA features
import pandas as pd
import pickle

df_pca = pd.read_csv('data/pca_features.csv')
model = pickle.load(open('models/loan_sales_model.pkl', 'rb'))

# Predict
X_new = df_pca[['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6']].iloc[-1:].values
prediction = model.predict(X_new)[0]
print(f"Predicted Loan Sales: {prediction:,.2f} AZN")
```

---

## Model Insights

### Key Drivers (PCA Component Interpretation)
1. **PC1 (Economic Scale, 48.41%)** - Overall economy size, banking scale
2. **PC2 (Profitability & Trade, 23.16%)** - Bank performance, exports
3. **PC3 (Seasonality, 12.79%)** - Quarterly patterns, construction cycles
4. **PC4 (Seasonal Risk, 5.73%)** - Credit risk seasonality
5. **PC5 (Interest Rates, 3.60%)** - Monetary policy effects
6. **PC6 (Residual, 1.51%)** - Minor variations

### Original Key Drivers (from PC loadings)
- **Economic Scale:** GDP, Income, Portfolio (highest weights in PC1)
- **Profitability:** ROA, ROE, Net Interest Margin (PC2)
- **Trade:** Exports, Imports (PC2)
- **Seasonality:** Quarter indicators (PC3, PC4)

### Advantages Over Manual Feature Selection
1. ✅ **No Multicollinearity:** PCA components are orthogonal
2. ✅ **Better Test Performance:** R² improved from 0.16 to 0.37
3. ✅ **Variance Preserved:** 95.21% of information retained
4. ✅ **Fewer Features:** 6 vs 14 (reduced complexity)

### Limitations
1. **Small Dataset:** Still only 22 quarters of data
2. **Interpretability:** PCA components less intuitive than raw features
3. **External Shocks:** Model may not capture unprecedented events
4. **Feature Stability:** Assumes PCA structure remains stable

---

## Recommendations

### For Production Use
1. **Retrain Regularly:** Update model as new data becomes available
2. **Re-run PCA:** Recompute PCA when new quarters are added
3. **Monitor Performance:** Track actual vs predicted over time
4. **Use with Caution:** Combine predictions with domain expertise

### For Improvement
1. **More Data:** Collect more historical quarters (target: 50+ samples)
2. **Feature Engineering:** Test polynomial and domain features
3. **Ensemble Methods:** Average predictions from multiple models
4. **External Data:** Include regional/global economic indicators

---

## Training Configuration

```python
# Feature Engineering
PCA: n_components=6 (preserving 95.21% variance)
Original Features: 28
Input Scaling: StandardScaler (applied before PCA)

# Model Training
Model: Ridge(alpha=1.0, random_state=42)
Test Size: 15%
Feature Scaling: None (PCA components already normalized)
Cross-Validation: 3-fold
Random State: 42
```

---

## Contact

For questions about the model, refer to the main project documentation.

**Files:**
- Data preparation: `data_preparation.py`
- Feature engineering: `feature_engineering.py` (generates PCA features)
- Training script: `train_model.py` (trains on PCA features)
- Model artifacts: `models/` directory
- PCA analysis: `charts/pca_analysis.png`
- Documentation: `FEATURE_ENGINEERING_REPORT.md`
