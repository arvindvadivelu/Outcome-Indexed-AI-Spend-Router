"""
AURA Pydantic v2 Schemas & Data Transfer Objects
Strict type safety without 'any' types.
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field

# --- Search & Synthesis ---
class CitationSchema(BaseModel):
    id: str
    citation_index: int
    title: str
    domain: str
    url: str
    trust_score: float

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="The search query string")
    model: str = Field(default="AURA Ultra 2.5", description="Selected AI model")
    is_pro: bool = Field(default=False, description="Enable autonomous multi-agent deep research")

class GraphNode(BaseModel):
    id: str
    group: str
    radius: int

class GraphLink(BaseModel):
    source: str
    target: str

class KnowledgeGraphData(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

class ImageResult(BaseModel):
    url: str
    title: str
    source: str

class NewsResult(BaseModel):
    headline: str
    source: str
    time: str
    snippet: str

class SearchResponse(BaseModel):
    query: str
    intent: str
    model: str
    is_pro: bool
    ai_summary: str
    latency_ms: int
    sources: List[CitationSchema]
    graph_data: KnowledgeGraphData
    images: List[ImageResult]
    news: List[NewsResult]
    suggested_follow_ups: List[str]

# --- Deep Research ---
class DeepResearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)

class DeepStepResult(BaseModel):
    id: str
    name: str
    description: str
    duration_ms: int
    status: str

class DeepResearchResponse(BaseModel):
    query: str
    status: str
    steps: List[DeepStepResult]
    consensus_score: float

# --- Specialized Widgets ---
class FinancePayload(BaseModel):
    ticker: str
    name: str
    price: float
    change: str
    is_positive: bool
    mkt_cap: str
    pe_ratio: str
    volume: str
    high_52: str
    low_52: str
    history: List[float]

class WeatherForecastDay(BaseModel):
    day: str
    temp: str
    icon: str

class WeatherPayload(BaseModel):
    city: str
    temp: str
    condition: str
    humidity: str
    wind: str
    uv: str
    forecast: List[WeatherForecastDay]

# --- Academic Scholar ---
class PaperPayload(BaseModel):
    id: str
    title: str
    authors: str
    journal: str
    year: int
    citations: int
    doi: str
    domain: str
    abstract: str
    bibtex: str

# --- Trends ---
class TrendTimeSeries(BaseModel):
    name: str
    color: str
    data: List[int]

class BreakoutTopic(BaseModel):
    rank: int
    title: str
    surge: str
    category: str
    volume: str

class TrendsPayload(BaseModel):
    timeframe: str
    series: List[TrendTimeSeries]
    breakouts: List[BreakoutTopic]

# --- Workspace & AI Docs ---
class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(default="")

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    title: str
    content: str
    word_count: int
    created_at: str
    updated_at: str

class AiActionRequest(BaseModel):
    document_id: str
    action: str = Field(..., pattern="^(expand|bullets|table|translate)$")
    context: str

class AiActionResponse(BaseModel):
    transformed_content: str
    action: str

# --- Vision Studio ---
class VisionPromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    style: str = Field(default="Photorealistic 8K")
    aspect_ratio: str = Field(default="16:9")

class VisionConceptResponse(BaseModel):
    prompt: str
    style: str
    aspect_ratio: str
    image_url: str
    neural_tags: List[str]
    palette: List[str]
