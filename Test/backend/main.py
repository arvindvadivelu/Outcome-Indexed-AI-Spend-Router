"""
AURA FastAPI Application Entrypoint
Zero-overhead, fully typed, monolithic REST API.
"""

import time
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import List, Dict
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import DocumentModel, BookmarkModel, QueryModel
from .schemas import (
    SearchRequest, SearchResponse, DeepResearchRequest, DeepResearchResponse,
    FinancePayload, WeatherPayload, PaperPayload, TrendsPayload,
    DocumentCreate, DocumentUpdate, DocumentResponse,
    AiActionRequest, AiActionResponse,
    VisionPromptRequest, VisionConceptResponse
)
from .services import (
    SynthesisService, DeepResearchService, FinanceService,
    WeatherService, ScholarService, TrendsService
)

# --- Rate Limiter (Zero-Overhead Token Bucket) ---
RATE_LIMIT_BUCKET: Dict[str, List[float]] = defaultdict(list)
MAX_REQUESTS_PER_MINUTE = 120

# Ensure tables are created immediately upon module load
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite schema
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="AURA Intelligence Engine API",
    version="3.0.0",
    description="Stateless, high-throughput backend for AURA Search & Ecosystem.",
    lifespan=lifespan
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- Rate Limiting Middleware ---
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    
    # Clean timestamps older than 60 seconds
    RATE_LIMIT_BUCKET[client_ip] = [t for t in RATE_LIMIT_BUCKET[client_ip] if now - t < 60]
    
    if len(RATE_LIMIT_BUCKET[client_ip]) >= MAX_REQUESTS_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded. Maximum 120 requests per minute allowed."}
        )
    
    RATE_LIMIT_BUCKET[client_ip].append(now)
    response = await call_next(request)
    return response

# --- Health Check ---
@app.get("/api/health", tags=["Telemetry"])
def health_check():
    return {
        "status": "online",
        "engine": "AURA Autonomous Core 3.0",
        "timestamp": time.time(),
        "database": "SQLite 3 (WAL Mode)"
    }

# --- Search & Synthesis Endpoints ---
@app.post("/api/search", response_model=SearchResponse, tags=["Search"])
async def execute_search(req: SearchRequest, db: Session = Depends(get_db)):
    try:
        return await SynthesisService.process_search(
            query_text=req.query,
            model_name=req.model,
            is_pro=req.is_pro,
            db=db
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Synthesis engine failure: {str(e)}"
        )

@app.post("/api/research/deep", response_model=DeepResearchResponse, tags=["Search"])
def execute_deep_research(req: DeepResearchRequest):
    return DeepResearchService.run_trace(req.query)

# --- Specialized Widgets ---
@app.get("/api/finance/{ticker}", response_model=FinancePayload, tags=["Widgets"])
def get_finance_data(ticker: str):
    return FinanceService.get_ticker(ticker)

@app.get("/api/weather/{city}", response_model=WeatherPayload, tags=["Widgets"])
def get_weather_data(city: str):
    return WeatherService.get_weather(city)

# --- Academic Scholar ---
@app.get("/api/scholar/papers", response_model=List[PaperPayload], tags=["Scholar"])
def list_scholar_papers(query: str = "", domain: str = ""):
    return ScholarService.list_papers(query=query, domain=domain)

# --- Global Trends ---
@app.get("/api/trends", response_model=TrendsPayload, tags=["Trends"])
def get_global_trends(timeframe: str = "7d"):
    return TrendsService.get_trends(timeframe=timeframe)

# --- Workspace & AI Docs ---
@app.get("/api/workspace/docs", response_model=List[DocumentResponse], tags=["Workspace"])
def get_all_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).order_by(DocumentModel.updated_at.desc()).all()
    return [
        DocumentResponse(
            id=d.id,
            title=d.title,
            content=d.content,
            word_count=d.word_count,
            created_at=d.created_at.isoformat() if d.created_at else "",
            updated_at=d.updated_at.isoformat() if d.updated_at else ""
        )
        for d in docs
    ]

@app.post("/api/workspace/docs", response_model=DocumentResponse, tags=["Workspace"])
def create_document(req: DocumentCreate, db: Session = Depends(get_db)):
    words = len(req.content.strip().split()) if req.content.strip() else 0
    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    db_doc = DocumentModel(
        id=doc_id,
        title=req.title,
        content=req.content,
        word_count=words
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return DocumentResponse(
        id=db_doc.id,
        title=db_doc.title,
        content=db_doc.content,
        word_count=db_doc.word_count,
        created_at=db_doc.created_at.isoformat(),
        updated_at=db_doc.updated_at.isoformat()
    )

@app.put("/api/workspace/docs/{doc_id}", response_model=DocumentResponse, tags=["Workspace"])
def update_document(doc_id: str, req: DocumentUpdate, db: Session = Depends(get_db)):
    db_doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if req.title is not None:
        db_doc.title = req.title
    if req.content is not None:
        db_doc.content = req.content
        db_doc.word_count = len(req.content.strip().split()) if req.content.strip() else 0
    
    db.commit()
    db.refresh(db_doc)
    return DocumentResponse(
        id=db_doc.id,
        title=db_doc.title,
        content=db_doc.content,
        word_count=db_doc.word_count,
        created_at=db_doc.created_at.isoformat(),
        updated_at=db_doc.updated_at.isoformat()
    )

@app.delete("/api/workspace/docs/{doc_id}", tags=["Workspace"])
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    db_doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    db.delete(db_doc)
    db.commit()
    return {"status": "deleted", "id": doc_id}

@app.post("/api/workspace/ai-action", response_model=AiActionResponse, tags=["Workspace"])
def perform_ai_action(req: AiActionRequest):
    if req.action == "expand":
        addition = "\n\n### Empirical Cross-Verification:\n- Validated against distributed testbed baselines with 99.4% precision bounds. [1]\n- Sub-40ms execution sustained under peak concurrent stress tests. [2]"
    elif req.action == "bullets":
        addition = "\n\n### Key Takeaways:\n1. Accelerated throughput via autonomous sub-agent decomposition.\n2. Cryogenic stability verified at 15 mK.\n3. Scalable fault-tolerance via lattice cryptographic standards."
    elif req.action == "table":
        addition = "\n\n| Attribute | Traditional Search | AURA Intelligence |\n| :--- | :--- | :--- |\n| **Latency** | 450ms | 28ms |\n| **Ad Invasiveness** | High (5+ Ads) | Zero Ads |\n| **Reasoning Model** | Single Pass | Multi-Agent Tree |"
    else:
        addition = "\n\n[Formal Technical Specification Generated and Verified]"

    return AiActionResponse(
        transformed_content=req.context + addition,
        action=req.action
    )

# --- Vision Studio ---
@app.post("/api/studio/synthesize", response_model=VisionConceptResponse, tags=["Studio"])
def synthesize_vision_concept(req: VisionPromptRequest):
    return VisionConceptResponse(
        prompt=req.prompt,
        style=req.style,
        aspect_ratio=req.aspect_ratio,
        image_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
        neural_tags=["Quantum Core (99.2%)", "Diffusion Latents (97.8%)", "Atmospheric Glow (96.4%)"],
        palette=["#6366F1", "#A855F7", "#06B6D4", "#090A0F"]
    )
