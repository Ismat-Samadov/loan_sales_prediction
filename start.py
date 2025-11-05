#!/usr/bin/env python3
"""
Simple startup script for the Loan Sales Prediction Web App
"""

import sys
import subprocess
from pathlib import Path

def main():
    print("🚀 Starting Loan Sales Prediction Web App")
    print("=" * 60)

    # Check if we're in the right directory
    app_dir = Path("app")
    if not app_dir.exists():
        print("❌ Error: 'app' directory not found")
        print("   Run this script from the project root directory")
        sys.exit(1)

    # Check if models exist
    models_dir = Path("notebooks/prediction/models")
    if not models_dir.exists():
        print("❌ Error: 'notebooks/prediction/models' directory not found")
        sys.exit(1)

    registry = models_dir / "model_registry.json"
    if not registry.exists():
        print("❌ Error: model_registry.json not found")
        print("   Run 'python notebooks/prediction/train_all_models.py' first")
        sys.exit(1)

    print("✅ All checks passed")
    print("🌐 Starting server on http://localhost:8000")
    print("📚 API docs available at http://localhost:8000/docs")
    print("=" * 60)
    print()

    # Start uvicorn
    try:
        subprocess.run([
            "python", "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "0.0.0.0",
            "--port", "8001"
        ])
    except KeyboardInterrupt:
        print("\n\n✅ Server stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
