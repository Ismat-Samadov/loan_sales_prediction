# Feature Engineering Report
## Loan Sales Prediction Model

**Date:** 2025-11-05
**Approach:** Manual feature engineering using PCA, polynomial features, and domain knowledge

---

## Overview

This report documents the feature engineering techniques applied to improve the loan sales prediction model. Instead of automated feature selection, we applied **manual dimensionality reduction and transformation techniques** to create meaningful features.

---

## 1. Principal Component Analysis (PCA)

### Purpose
Reduce dimensionality while preserving 95% of variance in the data.

### Results
- **Original features:** 28
- **PCA components:** 6 (preserving 95.21% variance)
- **Samples:** 22

### Variance Explained by Component

| Component | Individual Variance | Cumulative Variance |
|-----------|-------------------|-------------------|
| PC1 | 48.41% | 48.41% |
| PC2 | 23.16% | 71.58% |
| PC3 | 12.79% | 84.37% |
| PC4 | 5.73% | 90.10% |
| PC5 | 3.60% | 93.70% |
| PC6 | 1.51% | 95.21% |

### Component Interpretation

**PC1 (48.41% variance) - "Economic Scale"**
- Bank deposits (0.2654)
- Population income (0.2639)
- Portfolio size (0.2637)
- Money supply (0.2606)
- Consumer spending (0.2588)

*Interpretation:* Overall economic size and banking sector scale

**PC2 (23.16% variance) - "Profitability & Trade"**
- ROA (+0.3555)
- ROE (+0.3484)
- Net Interest Margin (+0.3458)
- Exports (+0.3026)
- Efficiency Ratio (-0.2973)

*Interpretation:* Bank profitability and export performance

**PC3 (12.79% variance) - "Seasonality & Construction"**
- Quarter (-0.4354)
- Construction spending (-0.3652)
- Quarter_Cos (-0.2859)
- Government spending (-0.2842)

*Interpretation:* Seasonal patterns and construction investment

**PC4 (5.73% variance) - "Seasonal Risk"**
- Quarter_Sin (+0.4721)
- Quarter_Cos (+0.4462)
- NPLs (-0.3312)
- Government revenue (+0.3023)

*Interpretation:* Seasonal variation in credit risk

**PC5 (3.60% variance) - "Interest Rate Policy"**
- Interest rate (+0.6239)
- Housing investment (-0.3739)
- Seasonal components

*Interpretation:* Monetary policy and housing investment

**PC6 (1.51% variance) - Residual variance

### Output File
`data/pca_features.csv` (22 rows × 7 columns)
- 6 principal components + target variable

---

## 2. Polynomial Features

### Purpose
Capture non-linear relationships and interactions between key economic indicators.

### Configuration
- **Degree:** 2 (quadratic terms + interactions)
- **Include bias:** No
- **Interaction only:** No (includes x² terms)

### Input Features (5 selected)
1. GDP
2. Əhalinin_nominal_gəlirləri (Population income)
3. Oil_Price
4. Portfel (Portfolio)
5. Müştəri_sayı (Customer count)

### Generated Features (20 total)

**Original features (5):**
- GDP, Income, Oil_Price, Portfel, Müştəri_sayı

**Quadratic terms (5):**
- GDP²
- Income²
- Oil_Price²
- Portfel²
- Müştəri_sayı²

**Interaction terms (10):**
- GDP × Income
- GDP × Oil_Price
- GDP × Portfel
- GDP × Müştəri_sayı
- Income × Oil_Price
- Income × Portfel
- Income × Müştəri_sayı
- Oil_Price × Portfel
- Oil_Price × Müştəri_sayı
- Portfel × Müştəri_sayı

### Output File
`data/polynomial_features.csv` (22 rows × 21 columns)
- 20 polynomial features + target variable

---

## 3. Domain-Specific Features

### Purpose
Create meaningful features based on business and economic domain knowledge.

### Created Features (13 total)

#### Growth Indicators

**1. GDP_Growth_YoY**
- Formula: `(GDP_t - GDP_t-4) / GDP_t-4 × 100`
- Measures: Year-over-Year GDP growth rate
- Business value: Economic expansion indicator

**2. Portfolio_Growth**
- Formula: `(Portfel_t - Portfel_t-1) / Portfel_t-1 × 100`
- Measures: Quarter-over-Quarter portfolio growth
- Business value: Loan book expansion rate

**3. Customer_Growth**
- Formula: `(Müştəri_t - Müştəri_t-1) / Müştəri_t-1 × 100`
- Measures: Customer base growth rate
- Business value: Market penetration

#### Efficiency Ratios

**4. Income_to_GDP_Ratio**
- Formula: `Population_Income / GDP`
- Measures: Income distribution efficiency
- Business value: Consumer purchasing power relative to economy

**5. Loan_per_Customer**
- Formula: `Portfel / Müştəri_sayı`
- Measures: Average loan size per customer
- Business value: Customer lending depth

**6. Housing_Affordability**
- Formula: `Population_Income / Housing_Prices`
- Measures: Housing affordability index
- Business value: Real estate market accessibility

#### Composite Indices

**7. Oil_Dependency_Index**
- Formula: `Oil_Price × Foreign_Trade`
- Measures: Economic dependence on oil
- Business value: Oil sector exposure (critical for Azerbaijan)

**8. Economic_Activity_Index**
- Formula: `(GDP/GDP_mean) × (Foreign_Trade/FT_mean)`
- Measures: Overall economic activity
- Business value: Normalized composite economic indicator

**9. Trade_Balance**
- Formula: `Exports - Imports`
- Measures: Net trade position
- Business value: External sector health

#### Lagged Features

**10. Sales_Lag1**
- Previous quarter's loan sales
- Captures: Short-term momentum

**11. Sales_Lag2**
- Sales from 2 quarters ago
- Captures: Medium-term trends

**12. Sales_Lag4**
- Sales from same quarter last year
- Captures: Seasonal patterns

#### Moving Averages

**13. Sales_MA2**
- 2-quarter moving average
- Smooths: Short-term fluctuations

**14. Sales_MA4**
- 4-quarter moving average (annual)
- Smooths: Seasonal variations

### Output File
`data/domain_engineered_features.csv` (23 rows × 46 columns)
- Original features (33) + new features (13) + target

---

## 4. Feature Engineering Summary

### Datasets Created

| Dataset | Features | Samples | File Size | Use Case |
|---------|----------|---------|-----------|----------|
| **PCA Features** | 6 | 22 | 2.8 KB | Dimensionality reduction, avoid multicollinearity |
| **Polynomial Features** | 20 | 22 | 7.7 KB | Non-linear relationships, interactions |
| **Domain Features** | 46 | 23 | 14 KB | Business-driven features, lagged values |

### Advantages of Each Approach

#### PCA Features
✅ Reduces multicollinearity (VIF was infinite for many features)
✅ Uncorrelated components
✅ Preserves 95% of information with 6 features (from 28)
✅ Computational efficiency
⚠️ Less interpretable for business stakeholders

#### Polynomial Features
✅ Captures non-linear relationships (e.g., GDP × Income)
✅ Models interaction effects
✅ Mathematically rigorous
⚠️ Risk of overfitting with small dataset (22 samples)
⚠️ Features can become highly correlated

#### Domain Features
✅ Highly interpretable for business users
✅ Based on economic theory and domain knowledge
✅ Captures temporal patterns (lags, moving averages)
✅ Meaningful growth rates and efficiency ratios
⚠️ Some features have missing values (due to lagging)

---

## 5. Recommendations for Modeling

### For Small Datasets (current: 22 samples)
**Recommended:** PCA Features
- Reduces overfitting risk
- Handles multicollinearity
- 6 features vs 22 samples = healthy ratio

### For Interpretability
**Recommended:** Domain Features
- Business stakeholders understand growth rates
- Clear economic meaning (GDP growth, customer efficiency)
- Easy to explain predictions

### For Non-linear Relationships
**Recommended:** Polynomial Features (with regularization)
- Use Ridge/Lasso with high alpha
- Consider only top interactions (GDP × Income, etc.)
- Monitor for overfitting with cross-validation

### Hybrid Approach
**Best practice:** Combine approaches
1. Use PCA to reduce original features to 4-5 components
2. Add 3-5 key domain features (GDP_Growth_YoY, Loan_per_Customer, Sales_Lag4)
3. Add 2-3 critical interactions (GDP × Income, Oil × Trade)
4. Final feature set: ~10-12 features total

---

## 6. Next Steps

### Model Training
1. Train models on each feature set separately
2. Compare performance:
   - PCA model
   - Polynomial model
   - Domain features model
   - Hybrid model
3. Use cross-validation (3-5 fold)
4. Select best performing approach

### Feature Refinement
1. Remove features with low importance (if using domain/polynomial)
2. Test different PCA variance thresholds (90%, 95%, 99%)
3. Experiment with polynomial degree (2 vs 3)
4. Add more domain features if needed

### Validation
1. Monitor train vs test performance
2. Check for overfitting
3. Validate business logic of predictions
4. Test on holdout period if more data becomes available

---

## 7. Files Generated

```
notebooks/
├── feature_engineering.py          # Main script
├── charts/
│   └── pca_analysis.png            # PCA visualization
└── data/
    ├── pca_features.csv            # 6 PCA components
    ├── polynomial_features.csv     # 20 polynomial features
    └── domain_engineered_features.csv  # 46 total features
```

---

## 8. Technical Implementation

### PCA Implementation
```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Apply PCA (95% variance)
pca = PCA(n_components=None)
pca.fit(X_scaled)
cumsum = np.cumsum(pca.explained_variance_ratio_)
n_components = np.argmax(cumsum >= 0.95) + 1  # 6 components

# Transform
pca = PCA(n_components=n_components)
X_pca = pca.fit_transform(X_scaled)
```

### Polynomial Implementation
```python
from sklearn.preprocessing import PolynomialFeatures

poly = PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)
X_poly = poly.fit_transform(X)
```

### Domain Features Implementation
```python
# Growth rates
df['GDP_Growth_YoY'] = df.groupby('Quarter')['GDP'].pct_change(periods=4) * 100

# Ratios
df['Loan_per_Customer'] = df['Portfel'] / df['Müştəri_sayı']

# Lags
df['Sales_Lag1'] = df['Nağd_pul_kredit_satışı'].shift(1)

# Moving averages
df['Sales_MA4'] = df['Nağd_pul_kredit_satışı'].rolling(window=4).mean()
```

---

## Conclusion

Three complementary feature engineering approaches have been implemented:

1. **PCA** - Optimal for small datasets, handles multicollinearity
2. **Polynomial** - Captures non-linear relationships
3. **Domain** - Most interpretable, business-friendly

Each dataset is saved separately for flexible model experimentation. The recommended approach for production is a **hybrid model** combining the strengths of all three methods while avoiding overfitting.
