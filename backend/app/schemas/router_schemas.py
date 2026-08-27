from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: system, user, assistant, tool")
    content: str = Field(..., description="Message content")

class RoutePreferences(BaseModel):
    strategy: Optional[str] = Field("outcome_optimized", description="outcome_optimized | cost_minimum | latency_prioritized | balanced_pareto")
    max_latency_ms: Optional[int] = Field(None, description="Max acceptable latency in ms")
    max_cost_usd: Optional[float] = Field(None, description="Max acceptable cost in USD")
    target_metric: Optional[str] = Field("conversion", description="Business outcome KPI to optimize for")
    task_type: Optional[str] = Field(None, description="sales_email | code_generation | customer_support | reasoning | etc.")
    fallback_model: Optional[str] = Field("gpt-4o", description="Fallback model if primary fails")
    enable_cache: Optional[bool] = Field(True, description="Enable prompt caching")
    enable_compression: Optional[bool] = Field(False, description="Enable context compression")

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = Field("auto", description="'auto' invokes the Outcome Router. Or pass a specific model.")
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000
    stream: Optional[bool] = False
    routing_preferences: Optional[RoutePreferences] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata tags (team_id, project_id, user_id)")

class ModelDecision(BaseModel):
    selected_model: str
    provider: str
    task_type: str
    complexity_score: float
    predicted_win_rate: float
    estimated_cost_usd: float
    estimated_latency_ms: int
    reasoning: str
    cache_hit: bool = False
    fallback_chain: List[str] = []

class OutcomeFeedbackRequest(BaseModel):
    request_id: str = Field(..., description="The ID of the routed request")
    outcome_success: bool = Field(..., description="Whether the business outcome succeeded (e.g. demo booked, code accepted)")
    metric_name: Optional[str] = Field("conversion", description="KPI metric name (e.g. demo_booked, ticket_resolved, code_merged)")
    revenue_impact_usd: Optional[float] = Field(0.0, description="Estimated direct dollar impact of this outcome")
    notes: Optional[str] = None

class ContextCompressionRequest(BaseModel):
    messages: List[ChatMessage]
    aggressive: Optional[bool] = False

class ContextCompressionResponse(BaseModel):
    compressed_messages: List[ChatMessage]
    original_tokens: int
    compressed_tokens: int
    tokens_saved: int
    compression_ratio_pct: float

class ModelBenchmarkItem(BaseModel):
    model_name: str
    provider: str
    task_type: str
    total_requests: int
    success_count: int
    win_rate: float
    avg_latency_ms: int
    avg_cost_usd: float
    cost_per_outcome_usd: float
    thompson_score: float

class RoutingRuleSchema(BaseModel):
    id: Optional[str] = None
    task_type: str
    is_active: bool = True
    priority_models: List[str]
    fallback_model: str = "gpt-4o"
    max_latency_ms: int = 1500
    max_cost_usd: float = 0.0500
    min_win_rate: float = 85.0
    strategy: str = "outcome_optimized"

class CostSavingsAnalytics(BaseModel):
    total_requests: int
    total_spend_usd: float
    total_spend_inr: float
    baseline_spend_usd: float
    baseline_spend_inr: float
    net_savings_usd: float
    net_savings_inr: float
    savings_percentage: float
    cache_hit_rate_pct: float
    tokens_saved_by_cache: int
    avg_outcome_win_rate_pct: float

# Aliases
RoutingRuleItem = RoutingRuleSchema
SavingsAnalyticsResponse = CostSavingsAnalytics
CompressRequest = ContextCompressionRequest
CompressResponse = ContextCompressionResponse
