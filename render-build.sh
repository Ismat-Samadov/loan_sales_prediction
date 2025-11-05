#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔧 Installing compatible Python packages..."

# Upgrade pip
pip install --upgrade pip

# Install compatible versions for Python 3.13
pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    jinja2==3.1.2 \
    python-multipart==0.0.6 \
    "pandas>=2.2.0" \
    "numpy>=1.26.0,<2.0.0" \
    scikit-learn==1.3.2 \
    statsmodels==0.14.0 \
    gunicorn==21.2.0

echo "✅ Build completed successfully!"
