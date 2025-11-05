#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔧 Installing Python packages with pre-built wheels for Python 3.13..."

# Upgrade pip and setuptools
python -m pip install --upgrade pip setuptools wheel

# Install numpy and pandas FIRST with pre-built wheels only (Python 3.13 compatible)
echo "📦 Installing numpy 2.x and pandas (Python 3.13 compatible)..."
pip install --only-binary=:all: numpy==2.1.0
pip install --only-binary=:all: pandas==2.2.3

# Install web framework packages
echo "🌐 Installing web framework packages..."
pip install --only-binary=:all: \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    jinja2==3.1.2 \
    python-multipart==0.0.6 \
    gunicorn==21.2.0

# Install ML packages (these depend on numpy/pandas)
echo "🤖 Installing ML packages..."
pip install --only-binary=:all: scikit-learn==1.6.0
pip install --only-binary=:all: statsmodels==0.14.4

echo "✅ Build completed successfully!"
