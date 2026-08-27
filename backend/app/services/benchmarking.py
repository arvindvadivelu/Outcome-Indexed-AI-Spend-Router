import time
from typing import Dict, Any, List
from app.schemas.router_schemas import ModelBenchmarkItem, OutcomeFeedbackRequest
from app.services.providers import MODEL_REGISTRY

class OutcomeBenchmarkTracker:
    """Manages Live A/B Outcome Benchmarks, Thompson Sampling Priors & Win Rates"""

    def __init__(self):
        # In-memory benchmark store
        self._benchmarks: Dict[str, Dict[str, Any]] = {
            # Task: sales_email
            "sales_email:claude-3-5-sonnet-20241022": {
                "model_name": "claude-3-5-sonnet-20241022",
                "provider": "anthropic",
                "task_type": "sales_email",
                "total_requests": 1420,
                "success_count": 1306,
                "win_rate": 0.9197,
                "avg_latency_ms": 420,
                "avg_cost_usd": 0.003400,
                "thompson_alpha": 131.0,
                "thompson_beta": 12.0
            },
            "sales_email:deepseek-chat": {
                "model_name": "deepseek-chat",
                "provider": "deepseek",
                "task_type": "sales_email",
                "total_requests": 1890,
                "success_count": 1695,
                "win_rate": 0.8968,
                "avg_latency_ms": 290,
                "avg_cost_usd": 0.000420,
                "thompson_alpha": 170.0,
                "thompson_beta": 20.0
            },
            "sales_email:gpt-4o": {
                "model_name": "gpt-4o",
                "provider": "openai",
                "task_type": "sales_email",
                "total_requests": 1150,
                "success_count": 989,
                "win_rate": 0.8600,
                "avg_latency_ms": 580,
                "avg_cost_usd": 0.005200,
                "thompson_alpha": 99.0,
                "thompson_beta": 17.0
            },
            "sales_email:gpt-4o-mini": {
                "model_name": "gpt-4o-mini",
                "provider": "openai",
                "task_type": "sales_email",
                "total_requests": 2200,
                "success_count": 1782,
                "win_rate": 0.8100,
                "avg_latency_ms": 210,
                "avg_cost_usd": 0.000300,
                "thompson_alpha": 179.0,
                "thompson_beta": 42.0
            },
            # Task: code_generation
            "code_generation:claude-3-5-sonnet-20241022": {
                "model_name": "claude-3-5-sonnet-20241022",
                "provider": "anthropic",
                "task_type": "code_generation",
                "total_requests": 3100,
                "success_count": 2920,
                "win_rate": 0.9419,
                "avg_latency_ms": 680,
                "avg_cost_usd": 0.006200,
                "thompson_alpha": 293.0,
                "thompson_beta": 19.0
            },
            "code_generation:deepseek-coder": {
                "model_name": "deepseek-coder",
                "provider": "deepseek",
                "task_type": "code_generation",
                "total_requests": 2800,
                "success_count": 2580,
                "win_rate": 0.9214,
                "avg_latency_ms": 390,
                "avg_cost_usd": 0.000650,
                "thompson_alpha": 259.0,
                "thompson_beta": 23.0
            },
            # Task: customer_support
            "customer_support:gpt-4o-mini": {
                "model_name": "gpt-4o-mini",
                "provider": "openai",
                "task_type": "customer_support",
                "total_requests": 8400,
                "success_count": 8064,
                "win_rate": 0.9600,
                "avg_latency_ms": 180,
                "avg_cost_usd": 0.000180,
                "thompson_alpha": 807.0,
                "thompson_beta": 34.0
            },
            "customer_support:llama-3.3-70b-versatile": {
                "model_name": "llama-3.3-70b-versatile",
                "provider": "groq",
                "task_type": "customer_support",
                "total_requests": 6200,
                "success_count": 5890,
                "win_rate": 0.9500,
                "avg_latency_ms": 95,
                "avg_cost_usd": 0.000210,
                "thompson_alpha": 590.0,
                "thompson_beta": 32.0
            }
        }

    def record_feedback(self, task_type: str, model_name: str, success: bool, cost_usd: float = 0.001):
        key = f"{task_type}:{model_name}"
        if key not in self._benchmarks:
            self._benchmarks[key] = {
                "model_name": model_name,
                "provider": MODEL_REGISTRY.get(model_name, {}).get("provider", "custom"),
                "task_type": task_type,
                "total_requests": 0,
                "success_count": 0,
                "win_rate": 0.0,
                "avg_latency_ms": 250,
                "avg_cost_usd": cost_usd,
                "thompson_alpha": 1.0,
                "thompson_beta": 1.0
            }

        bm = self._benchmarks[key]
        bm["total_requests"] += 1
        if success:
            bm["success_count"] += 1
            bm["thompson_alpha"] += 1.0
        else:
            bm["thompson_beta"] += 1.0

        bm["win_rate"] = round(bm["success_count"] / bm["total_requests"], 4)

    def get_benchmarks(self, task_type: str = None) -> List[ModelBenchmarkItem]:
        items = []
        for key, bm in self._benchmarks.items():
            if task_type and bm["task_type"] != task_type:
                continue
            
            # Cost per positive outcome = Avg Cost / Win Rate
            win_rate = max(0.01, bm["win_rate"])
            cost_per_outcome = round(bm["avg_cost_usd"] / win_rate, 6)
            
            # Thompson sampling mean expected value
            thompson_score = round(bm["thompson_alpha"] / (bm["thompson_alpha"] + bm["thompson_beta"]), 4)

            items.append(ModelBenchmarkItem(
                model_name=bm["model_name"],
                provider=bm["provider"],
                task_type=bm["task_type"],
                total_requests=bm["total_requests"],
                success_count=bm["success_count"],
                win_rate=bm["win_rate"],
                avg_latency_ms=bm["avg_latency_ms"],
                avg_cost_usd=bm["avg_cost_usd"],
                cost_per_outcome_usd=cost_per_outcome,
                thompson_score=thompson_score
            ))

        items.sort(key=lambda x: (x.task_type, -x.win_rate))
        return items

benchmark_tracker = OutcomeBenchmarkTracker()
benchmark_service = benchmark_tracker
