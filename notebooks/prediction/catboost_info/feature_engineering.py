"""
Feature Engineering for Loan Sales Prediction

This script applies dimensionality reduction and feature transformation techniques:
1. Principal Component Analysis (PCA)
2. Polynomial Features
3. Interaction Features
4. Domain-specific feature engineering

Usage:
    python feature_engineering.py
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')


def load_data(data_path):
    """Load preprocessed data"""
    print(f"📂 Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"✅ Data loaded: {df.shape[0]} rows × {df.shape[1]} columns\n")
    return df


def apply_pca(df, target_col, n_components=None, variance_threshold=0.95):
    """
    Apply PCA for dimensionality reduction

    Parameters:
    - n_components: Number of components (if None, use variance_threshold)
    - variance_threshold: Cumulative variance to preserve (default 95%)
    """
    print("🔬 Principal Component Analysis (PCA)")
    print("=" * 80)

    # Select numeric features (exclude target and leakage features)
    exclude_cols = [target_col, 'Kumulyativ_satish', 'Rüblər', 'Time_Index', 'NPL_percentage']
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    feature_cols = [col for col in numeric_cols if col not in exclude_cols]

    # Remove rows with missing values
    df_clean = df[[target_col] + feature_cols].dropna()
    X = df_clean[feature_cols]
    y = df_clean[target_col]

    print(f"Original features: {len(feature_cols)}")
    print(f"Samples: {len(X)}\n")

    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Apply PCA
    if n_components is None:
        # Determine components needed for variance threshold
        pca_full = PCA()
        pca_full.fit(X_scaled)
        cumsum = np.cumsum(pca_full.explained_variance_ratio_)
        n_components = np.argmax(cumsum >= variance_threshold) + 1

    pca = PCA(n_components=n_components)
    X_pca = pca.fit_transform(X_scaled)

    # Create DataFrame with PCA components
    pca_cols = [f'PC{i+1}' for i in range(n_components)]
    df_pca = pd.DataFrame(X_pca, columns=pca_cols, index=df_clean.index)
    df_pca[target_col] = y.values

    # Print results
    print(f"Selected components: {n_components}")
    print(f"Cumulative variance explained: {pca.explained_variance_ratio_.sum():.4f}\n")

    print("Explained variance by component:")
    for i, var in enumerate(pca.explained_variance_ratio_):
        cumvar = pca.explained_variance_ratio_[:i+1].sum()
        print(f"  PC{i+1}: {var:.4f} (cumulative: {cumvar:.4f})")

    # Feature loadings (importance)
    print("\n\nTop 5 features contributing to each component:")
    loadings = pd.DataFrame(
        pca.components_.T,
        columns=pca_cols,
        index=feature_cols
    )

    for i in range(min(5, n_components)):  # Show first 5 PCs
        print(f"\nPC{i+1}:")
        top_features = loadings[f'PC{i+1}'].abs().nlargest(5)
        for feat, load in top_features.items():
            sign = '+' if loadings.loc[feat, f'PC{i+1}'] > 0 else '-'
            print(f"  {sign} {feat:45s}: {abs(load):.4f}")

    # Visualize
    visualize_pca(pca, feature_cols, n_components)

    return df_pca, pca, scaler, feature_cols


def visualize_pca(pca, feature_names, n_components):
    """Create PCA visualization"""
    print("\n📊 Creating PCA visualizations...")

    # 1. Scree plot
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Variance explained
    var_exp = pca.explained_variance_ratio_
    cum_var_exp = np.cumsum(var_exp)

    ax = axes[0]
    x = np.arange(1, len(var_exp) + 1)
    ax.bar(x, var_exp, alpha=0.7, label='Individual')
    ax.plot(x, cum_var_exp, 'ro-', label='Cumulative', linewidth=2)
    ax.axhline(y=0.95, color='g', linestyle='--', label='95% threshold')
    ax.set_xlabel('Principal Component', fontsize=12, fontweight='bold')
    ax.set_ylabel('Variance Explained', fontsize=12, fontweight='bold')
    ax.set_title('PCA Scree Plot - Variance Explained', fontsize=14, fontweight='bold')
    ax.legend()
    ax.grid(True, alpha=0.3)

    # 2. Component loadings heatmap
    ax = axes[1]
    loadings = pd.DataFrame(
        pca.components_[:min(5, n_components)].T,
        columns=[f'PC{i+1}' for i in range(min(5, n_components))],
        index=feature_names
    )

    # Get top features across all PCs
    top_features = loadings.abs().sum(axis=1).nlargest(15).index
    sns.heatmap(loadings.loc[top_features], annot=False, cmap='RdBu_r',
                center=0, cbar_kws={'label': 'Loading'}, ax=ax)
    ax.set_title('Top 15 Feature Loadings (First 5 PCs)', fontsize=14, fontweight='bold')
    ax.set_xlabel('Principal Components', fontsize=12, fontweight='bold')
    ax.set_ylabel('Features', fontsize=12, fontweight='bold')

    plt.tight_layout()
    plt.savefig('charts/pca_analysis.png', dpi=300, bbox_inches='tight')
    print("✅ Saved: charts/pca_analysis.png")
    plt.close()


def create_polynomial_features(df, target_col, degree=2, interaction_only=False):
    """Create polynomial and interaction features"""
    print("\n\n🔬 Polynomial Feature Engineering")
    print("=" * 80)

    # Select key features for polynomial expansion
    # (Don't use all features to avoid explosion)
    key_features = [
        'GDP',
        'Əhalinin_nominal_gəlirləri',
        'Oil_Price',
        'Portfel',
        'Müştəri_sayı'
    ]

    # Check which features exist
    available_features = [f for f in key_features if f in df.columns]
    print(f"Creating polynomial features (degree={degree}) for:")
    for feat in available_features:
        print(f"  - {feat}")

    # Remove rows with missing values
    df_clean = df[[target_col] + available_features].dropna()
    X = df_clean[available_features]
    y = df_clean[target_col]

    # Create polynomial features
    poly = PolynomialFeatures(degree=degree, interaction_only=interaction_only, include_bias=False)
    X_poly = poly.fit_transform(X)

    # Get feature names
    poly_feature_names = poly.get_feature_names_out(available_features)

    # Create DataFrame
    df_poly = pd.DataFrame(X_poly, columns=poly_feature_names, index=df_clean.index)
    df_poly[target_col] = y.values

    print(f"\nOriginal features: {len(available_features)}")
    print(f"Polynomial features: {len(poly_feature_names)}")
    print(f"Samples: {len(X_poly)}")

    # Show some interaction features
    interaction_features = [col for col in poly_feature_names if ' ' in col][:10]
    if interaction_features:
        print("\nExample interaction features:")
        for feat in interaction_features:
            print(f"  - {feat}")

    return df_poly, poly, available_features


def create_domain_features(df):
    """Create domain-specific features"""
    print("\n\n🔬 Domain-Specific Feature Engineering")
    print("=" * 80)

    df_eng = df.copy()
    new_features = []

    # 1. Economic growth rate (YoY GDP growth)
    if 'GDP' in df.columns and 'Quarter' in df.columns:
        df_eng['GDP_Growth_YoY'] = df_eng.groupby('Quarter')['GDP'].pct_change(periods=4) * 100
        new_features.append('GDP_Growth_YoY')
        print("✓ Created: GDP_Growth_YoY (Year-over-Year GDP growth %)")

    # 2. Income to GDP ratio
    if 'Əhalinin_nominal_gəlirləri' in df.columns and 'GDP' in df.columns:
        df_eng['Income_to_GDP_Ratio'] = df_eng['Əhalinin_nominal_gəlirləri'] / df_eng['GDP']
        new_features.append('Income_to_GDP_Ratio')
        print("✓ Created: Income_to_GDP_Ratio")

    # 3. Portfolio growth rate
    if 'Portfel' in df.columns:
        df_eng['Portfolio_Growth'] = df_eng['Portfel'].pct_change() * 100
        new_features.append('Portfolio_Growth')
        print("✓ Created: Portfolio_Growth (Quarter-over-Quarter %)")

    # 4. Customer growth rate
    if 'Müştəri_sayı' in df.columns:
        df_eng['Customer_Growth'] = df_eng['Müştəri_sayı'].pct_change() * 100
        new_features.append('Customer_Growth')
        print("✓ Created: Customer_Growth (Quarter-over-Quarter %)")

    # 5. Trade balance (exports - imports)
    if 'İxrac' in df.columns and 'İdxal' in df.columns:
        df_eng['Trade_Balance'] = df_eng['İxrac'] - df_eng['İdxal']
        new_features.append('Trade_Balance')
        print("✓ Created: Trade_Balance (Exports - Imports)")

    # 6. Loan per customer
    if 'Portfel' in df.columns and 'Müştəri_sayı' in df.columns:
        df_eng['Loan_per_Customer'] = df_eng['Portfel'] / df_eng['Müştəri_sayı']
        new_features.append('Loan_per_Customer')
        print("✓ Created: Loan_per_Customer")

    # 7. Oil dependency index (Oil price * Foreign trade)
    if 'Oil_Price' in df.columns and 'Xarici_ticarət_dövriyyəsi' in df.columns:
        df_eng['Oil_Dependency_Index'] = df_eng['Oil_Price'] * df_eng['Xarici_ticarət_dövriyyəsi']
        new_features.append('Oil_Dependency_Index')
        print("✓ Created: Oil_Dependency_Index")

    # 8. Economic activity index (GDP * Foreign trade)
    if 'GDP' in df.columns and 'Xarici_ticarət_dövriyyəsi' in df.columns:
        # Normalize to avoid huge numbers
        df_eng['Economic_Activity_Index'] = (
            (df_eng['GDP'] / df_eng['GDP'].mean()) *
            (df_eng['Xarici_ticarət_dövriyyəsi'] / df_eng['Xarici_ticarət_dövriyyəsi'].mean())
        )
        new_features.append('Economic_Activity_Index')
        print("✓ Created: Economic_Activity_Index")

    # 9. Housing affordability (Income / Housing price)
    if 'Əhalinin_nominal_gəlirləri' in df.columns and 'Mənzil_qiymətləri' in df.columns:
        df_eng['Housing_Affordability'] = df_eng['Əhalinin_nominal_gəlirləri'] / df_eng['Mənzil_qiymətləri']
        new_features.append('Housing_Affordability')
        print("✓ Created: Housing_Affordability")

    # 10. Lagged features (previous quarter's sales)
    if 'Nağd_pul_kredit_satışı' in df.columns:
        df_eng['Sales_Lag1'] = df_eng['Nağd_pul_kredit_satışı'].shift(1)
        df_eng['Sales_Lag2'] = df_eng['Nağd_pul_kredit_satışı'].shift(2)
        df_eng['Sales_Lag4'] = df_eng['Nağd_pul_kredit_satışı'].shift(4)  # Same quarter last year
        new_features.extend(['Sales_Lag1', 'Sales_Lag2', 'Sales_Lag4'])
        print("✓ Created: Sales_Lag1, Sales_Lag2, Sales_Lag4 (lagged features)")

    # 11. Moving averages
    if 'Nağd_pul_kredit_satışı' in df.columns:
        df_eng['Sales_MA2'] = df_eng['Nağd_pul_kredit_satışı'].rolling(window=2, min_periods=1).mean()
        df_eng['Sales_MA4'] = df_eng['Nağd_pul_kredit_satışı'].rolling(window=4, min_periods=1).mean()
        new_features.extend(['Sales_MA2', 'Sales_MA4'])
        print("✓ Created: Sales_MA2, Sales_MA4 (moving averages)")

    print(f"\n✅ Created {len(new_features)} domain-specific features")

    return df_eng, new_features


def save_engineered_data(df_pca, df_poly, df_domain, output_dir='data'):
    """Save all engineered datasets"""
    print("\n\n💾 Saving Engineered Data")
    print("=" * 80)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Save PCA features
    pca_file = output_path / 'pca_features.csv'
    df_pca.to_csv(pca_file, index=False)
    print(f"✅ PCA features: {pca_file}")
    print(f"   Shape: {df_pca.shape}")

    # Save polynomial features
    poly_file = output_path / 'polynomial_features.csv'
    df_poly.to_csv(poly_file, index=False)
    print(f"✅ Polynomial features: {poly_file}")
    print(f"   Shape: {df_poly.shape}")

    # Save domain features
    domain_file = output_path / 'domain_engineered_features.csv'
    df_domain.to_csv(domain_file, index=False)
    print(f"✅ Domain features: {domain_file}")
    print(f"   Shape: {df_domain.shape}")


def main():
    """Main execution function"""
    print("\n" + "=" * 80)
    print("FEATURE ENGINEERING - LOAN SALES PREDICTION")
    print("=" * 80 + "\n")

    # Define paths
    BASE_DIR = Path(__file__).parent
    DATA_PATH = BASE_DIR / 'data' / 'ml_ready_data.csv'
    OUTPUT_DIR = BASE_DIR / 'data'

    # Target variable
    target_col = 'Nağd_pul_kredit_satışı'

    try:
        # Load data
        df = load_data(DATA_PATH)

        # 1. PCA - Dimensionality reduction
        df_pca, pca, scaler, feature_names = apply_pca(
            df, target_col,
            n_components=None,  # Auto-select for 95% variance
            variance_threshold=0.95
        )

        # 2. Polynomial features
        df_poly, poly_transformer, poly_input_features = create_polynomial_features(
            df, target_col,
            degree=2,
            interaction_only=False  # Include x^2 terms
        )

        # 3. Domain-specific features
        df_domain, domain_features = create_domain_features(df)

        # 4. Save all engineered datasets
        save_engineered_data(df_pca, df_poly, df_domain, OUTPUT_DIR)

        print("\n" + "=" * 80)
        print("✅ FEATURE ENGINEERING COMPLETE")
        print("=" * 80)

        print("\n📊 Summary:")
        print(f"  PCA Components: {df_pca.shape[1] - 1}")  # -1 for target
        print(f"  Polynomial Features: {df_poly.shape[1] - 1}")
        print(f"  Domain Features: {len(domain_features)} new features added")

        return df_pca, df_poly, df_domain

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    df_pca, df_poly, df_domain = main()
