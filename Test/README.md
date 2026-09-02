# AURA — Production-Ready AI Ecosystem (Google Competitor MVP)

**AURA (Autonomous Universal Reasoning & Answer Platform)** is a production-grade, zero-overhead monolith engineered with **FastAPI**, **SQLite 3 in WAL Mode**, and a **pure ESM client-side architecture** competing directly with Google's search, vision, maps, scholar, workspace, and trends services.

---

## 🚀 One-Command Launch

### Start the Unified Platform (Frontend + Backend + Database)
```bash
cd Test
python run_aura.py
```
*(Or double-click `start_aura.bat` on Windows)*

Once running, access the entire platform on **`http://127.0.0.1:8000/`**:

- **Search & SERP 3.0**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Vision Studio**: [http://127.0.0.1:8000/studio.html](http://127.0.0.1:8000/studio.html)
- **Quantum Spatial Maps**: [http://127.0.0.1:8000/maps.html](http://127.0.0.1:8000/maps.html)
- **Scholar Research Lab**: [http://127.0.0.1:8000/scholar.html](http://127.0.0.1:8000/scholar.html)
- **Cloud Workspace & AI Docs**: [http://127.0.0.1:8000/workspace.html](http://127.0.0.1:8000/workspace.html)
- **Global Trends & Velocity**: [http://127.0.0.1:8000/trends.html](http://127.0.0.1:8000/trends.html)
- **Interactive OpenAPI Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🛠️ Monolithic Zero-Overhead Architecture

```
Test/
├── run_aura.py             # Single-command unified FastAPI production runner
├── start_aura.bat          # Windows click-to-run batch launcher
├── README.md               # Architecture documentation
├── backend/
│   ├── database.py         # SQLite 3 engine with WAL mode & session factory
│   ├── models.py           # SQLAlchemy ORM relational models
│   ├── schemas.py          # Pydantic v2 schemas (no 'any' types)
│   ├── services.py         # Business logic, synthesis, research, and APIs
│   ├── main.py             # FastAPI entrypoint, CORS, rate limiter, static mount
│   └── requirements.txt    # Python dependencies
├── css/
│   ├── design-system.css   # Color tokens, themes (Obsidian, Cyber, Navy, Light)
│   ├── components.css      # SERP 3.0 cards, search pills, knowledge graphs
│   └── pages.css           # Multi-page layouts for Studio, Maps, Scholar, Workspace, Trends
├── js/
│   ├── apiClient.js        # Central REST API client with local fallback
│   ├── app.js              # Flagship search controller
│   ├── nav.js              # Waffle app launcher & theme synchronizer
│   ├── engine/             # Search intent routing & dataset repository
│   ├── features/           # Knowledge graph, widgets, voice/TTS, research trace
│   └── pages/              # Dedicated page controllers (Studio, Maps, Scholar, Workspace, Trends)
├── index.html              # Search & SERP 3.0
├── studio.html             # Vision Studio
├── maps.html               # Quantum Maps
├── scholar.html            # Scholar Lab
├── workspace.html          # Cloud AI Docs
└── trends.html             # Global Trends
```

---

## 🔒 Security & Performance Guarantees

1. **Zero Silent Failures**: All REST endpoints return standardized HTTP exceptions (400, 404, 429, 500) with detailed JSON error messages.
2. **Token-Bucket Rate Limiter**: 120 requests/min per IP to prevent scraper exhaustion.
3. **WAL Mode Concurrency**: High-speed concurrent reads and writes with zero database lockups.
4. **CORS Validation**: Cross-origin headers enabled across all endpoints.
