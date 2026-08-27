import random
import uuid
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.router_schemas import RoutePreferences, ModelDecision, ChatMessage
from app.services.providers import MODEL_REGISTRY, MultiModelGateway

# Task-type heuristics and keyword classifiers
TASK_PATTERNS = {
    "sales_email": ["outreach", "cold email", "pitch", "prospect", "sales", "demo", "reply to lead", "follow up"],
    "code_generation": ["def ", "class ", "function", "sql", "bug", "typescript", "python", "react", "algorithm", "fix error", "api endpoint"],
    "customer_support": ["refund", "billing issue", "cancel", "how do i", "login problem", "ticket", "error message", "help me with my account"],
    "complex_reasoning": ["mathematical proof", "multi-step logic", "architecture trade-offs", "financial modeling", "deep analysis", "game theory"],
    "content_marketing": ["blog post", "seo", "article", "newsletter", "social media post", "twitter thread", "copywriting"]
}

# Empirical benchmark priors (win_rate, avg_cost, avg_latency)
HISTORICAL_PRIORS = {
    "sales_email": {
        "claude-3-5-sonnet-20241022": {"alpha": 142.0, "beta": 12.0, "avg_cost": 0.0034, "avg_lat": 420},
        "deepseek-chat": {"alpha": 180.0, "beta": 18.0, "avg_cost": 0.00042, "avg_lat": 290},
        "gpt-4o": {"alpha": 110.0, "beta": 18.0, "avg_cost": 0.0052, "avg_lat": 480},
        "gpt-4o-mini": {"alpha": 95.0, "beta": 22.0, "avg_cost": 0.0003, "avg_lat": 180},
    },
    "code_generation": {
        "claude-3-5-sonnet-20241022": {"alpha": 290.0, "beta": 15.0, "avg_cost": 0.0062, "avg_lat": 680},
        "deepseek-coder": {"alpha": 260.0, "beta": 21.0, "avg_cost": 0.00065, "avg_lat": 390},
        "gpt-4o": {"alpha": 240.0, "beta": 25.0, "avg_cost": 0.0078, "avg_lat": 720},
        "gpt-4o-mini": {"alpha": 140.0, "beta": 45.0, "avg_cost": 0.0004, "avg_lat": 220},
    },
    "customer_support": {
        "gpt-4o-mini": {"alpha": 810.0, "beta": 32.0, "avg_cost": 0.00018, "avg_lat": 180},
        "llama-3.3-70b-versatile": {"alpha": 590.0, "beta": 30.0, "avg_cost": 0.00021, "avg_lat": 95},
        "deepseek-chat": {"alpha": 420.0, "beta": 25.0, "avg_cost": 0.00020, "avg_lat": 210},
        "claude-3-haiku-20240307": {"alpha": 480.0, "beta": 26.0, "avg_cost": 0.00035, "avg_lat": 190},
    },
    "complex_reasoning": {
        "o1-mini": {"alpha": 180.0, "beta": 14.0, "avg_cost": 0.0045, "avg_lat": 850},
        "claude-3-5-sonnet-20241022": {"alpha": 210.0, "beta": 20.0, "avg_cost": 0.0055, "avg_lat": 620},
        "gpt-4o": {"alpha": 190.0, "beta": 22.0, "avg_cost": 0.0065, "avg_lat": 590},
    },
    "general": {
        "deepseek-chat": {"alpha": 150.0, "beta": 15.0, "avg_cost": 0.00035, "avg_lat": 240},
        "gpt-4o-mini": {"alpha": 160.0, "beta": 20.0, "avg_cost": 0.00025, "avg_lat": 180},
        "claude-3-5-sonnet-20241022": {"alpha": 190.0, "beta": 12.0, "avg_cost": 0.0045, "avg_lat": 440},
    }
}

class OutcomeRouterEngine:
    """Intelligent Routing Engine optimizing for Cost per Successful Business Outcome"""

    @staticmethod
    def classify_task_and_complexity(messages: List[Any]) -> Tuple[str, float]:
        """
        Classifies prompt task type and complexity score (0.0 to 1.0)
        """
        full_text = " ".join([
            (m.content if hasattr(m, "content") else m.get("content", "")).lower()
            for m in messages
        ])
        total_words = len(full_text.split())

        # Determine task type
        detected_task = "general"
        highest_score = 0
        for task, keywords in TASK_PATTERNS.items():
            matches = sum(1 for kw in keywords if kw in full_text)
            if matches > highest_score:
                highest_score = matches
                detected_task = task

        # Compute complexity score
        length_factor = min(1.0, total_words / 800.0) * 0.4
        code_factor = 0.3 if "```" in full_text or "def " in full_text or "class " in full_text else 0.0
        multi_prompt_factor = min(0.3, len(messages) * 0.05)
        
        complexity_score = min(1.0, round(length_factor + code_factor + multi_prompt_factor + 0.1, 2))
        return detected_task, complexity_score

    async def select_optimal_model(
        self,
        messages: List[Dict[str, str]],
        strategy: str = "outcome_optimized",
        target_metric: str = "conversion_success",
        sla_max_latency_ms: int = 500
    ) -> Dict[str, Any]:
        task_type, complexity = self.classify_task_and_complexity(messages)
        priors = HISTORICAL_PRIORS.get(task_type, HISTORICAL_PRIORS["general"])

        candidates = []
        for model_name, prior in priors.items():
            # Thompson Sampling
            sampled_win_rate = np.random.beta(prior["alpha"], prior["beta"])
            cost = prior["avg_cost"]
            lat = prior["avg_lat"]

            # Pareto score
            if strategy == "cost_minimum":
                score = (sampled_win_rate * 0.3) - (cost * 100.0)
            elif strategy == "latency_prioritized":
                score = (sampled_win_rate * 0.4) - (lat * 0.01) - (cost * 10.0)
            else:
                # Outcome-Optimized Pareto
                score = (sampled_win_rate * 0.7) - (cost * 25.0)

            if lat > sla_max_latency_ms:
                score -= 50.0

            candidates.append({
                "model_name": model_name,
                "provider": MODEL_REGISTRY.get(model_name, {}).get("provider", "openai"),
                "win_rate": sampled_win_rate,
                "cost": cost,
                "lat": lat,
                "score": score
            })

        candidates.sort(key=lambda x: x["score"], reverse=True)
        winner = candidates[0]
        
        baseline_cost = 0.0052
        saved_usd = max(0.0, baseline_cost - winner["cost"])

        return {
            "request_id": f"oir_req_{uuid.uuid4().hex[:8]}",
            "selected_model": winner["model_name"],
            "provider": winner["provider"],
            "task_type": task_type,
            "complexity_score": complexity,
            "sampled_win_rate": round(float(winner["win_rate"]), 4),
            "estimated_cost_usd": round(float(winner["cost"]), 6),
            "estimated_cost_saved_usd": round(float(saved_usd), 6),
            "expected_latency_ms": int(winner["lat"]),
            "fallback_chain": [c["model_name"] for c in candidates[1:]]
        }

outcome_router_engine = OutcomeRouterEngine()
