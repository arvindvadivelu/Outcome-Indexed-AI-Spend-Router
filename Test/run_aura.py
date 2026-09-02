"""
AURA Production-Ready Monolithic Server Runner
Starts the FastAPI backend and serves the full multi-page ecosystem on http://127.0.0.1:8000
"""

import sys
import os
import uvicorn

if __name__ == "__main__":
    # Ensure current directory is in Python path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir not in sys.path:
        sys.path.insert(0, base_dir)

    print("=" * 65)
    print("  [*] AURA INTELLIGENCE PLATFORM -- PRODUCTION MVP RUNNER")
    print("=" * 65)
    print("  * Web Interface & SERP 3.0:  http://127.0.0.1:8000/")
    print("  * Vision Studio:             http://127.0.0.1:8000/studio.html")
    print("  * Quantum Maps:              http://127.0.0.1:8000/maps.html")
    print("  * Scholar Research Lab:      http://127.0.0.1:8000/scholar.html")
    print("  * Cloud Workspace:           http://127.0.0.1:8000/workspace.html")
    print("  * Global Trends:             http://127.0.0.1:8000/trends.html")
    print("  * Interactive API Docs:      http://127.0.0.1:8000/docs")
    print("=" * 65)

    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
