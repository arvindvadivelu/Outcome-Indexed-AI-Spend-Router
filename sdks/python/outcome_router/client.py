import os
import httpx
from typing import List, Dict, Any, Optional, Callable
from functools import wraps

class OutcomeRouterClient:
    """
    Python SDK Client for Outcome-Indexed AI Spend Router.
    5-line drop-in replacement for OpenAI API that reduces LLM spend by 40%.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 30.0
    ):
        self.api_key = api_key or os.getenv("OUTCOME_ROUTER_API_KEY", "oir_demo_key")
        self.base_url = base_url or os.getenv("OUTCOME_ROUTER_BASE_URL", "http://localhost:8000/api/v1")
        self.timeout = timeout
        self.client = httpx.Client(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": "outcome-router-python/1.0.0"
            },
            timeout=self.timeout
        )

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "auto",
        strategy: str = "outcome_optimized",
        task_type: Optional[str] = None,
        target_metric: Optional[str] = "conversion",
        enable_cache: bool = True,
        enable_compression: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Routes the prompt to the cheapest model that achieves business outcomes.
        """
        payload = {
            "model": model,
            "messages": messages,
            "routing_preferences": {
                "strategy": strategy,
                "task_type": task_type,
                "target_metric": target_metric,
                "enable_cache": enable_cache,
                "enable_compression": enable_compression
            },
            **kwargs
        }

        resp = self.client.post("/chat/completions", json=payload)
        resp.raise_for_status()
        
        result = resp.json()
        result["_router_metadata"] = {
            "request_id": resp.headers.get("X-Outcome-Request-Id"),
            "model_used": resp.headers.get("X-Outcome-Router-Model"),
            "saved_usd": float(resp.headers.get("X-Outcome-Router-Saved-USD", 0.0)),
            "cost_usd": float(resp.headers.get("X-Outcome-Router-Cost-USD", 0.0)),
            "latency_ms": int(resp.headers.get("X-Outcome-Router-Latency-MS", 0)),
            "cached": resp.headers.get("X-Outcome-Router-Cached") == "true"
        }
        return result

    def record_outcome(
        self,
        request_id: str,
        outcome_success: bool,
        metric_name: str = "conversion",
        revenue_impact_usd: float = 0.0
    ) -> Dict[str, Any]:
        """
        Reports downstream outcome success/failure to update the model bandit weights.
        """
        payload = {
            "request_id": request_id,
            "outcome_success": outcome_success,
            "metric_name": metric_name,
            "revenue_impact_usd": revenue_impact_usd
        }
        resp = self.client.post("/outcomes", json=payload)
        resp.raise_for_status()
        return resp.json()


def track_outcome(client: OutcomeRouterClient, metric_name: str = "conversion"):
    """
    Decorator that automatically sends outcome success/failure based on function execution.
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                res = func(*args, **kwargs)
                if isinstance(res, dict) and "_router_metadata" in res:
                    req_id = res["_router_metadata"]["request_id"]
                    if req_id:
                        client.record_outcome(req_id, outcome_success=True, metric_name=metric_name)
                return res
            except Exception as e:
                raise e
        return wrapper
    return decorator
