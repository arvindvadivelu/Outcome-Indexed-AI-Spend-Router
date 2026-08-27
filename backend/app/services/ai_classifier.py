import re
from typing import Dict, Any, List

class ZeroShotAIClassifier:
    """
    Zero-shot semantic classifier that evaluates prompt complexity,
    reasoning depth requirement, and task domain to predict the optimal
    model tier before dispatching to Bayesian multi-armed bandits.
    """

    TASK_TAXONOMY = {
        "code_generation": [
            "function", "def ", "class ", "async", "typescript", "python", "sql", "refactor",
            "regex", "interface", "bug", "algorithm", "endpoint", "database", "query", "schema"
        ],
        "sales_email": [
            "cold email", "outreach", "sdr", "follow-up", "prospect", "subject line",
            "value proposition", "pitch", "schedule demo", "pipeline", "meeting"
        ],
        "customer_support": [
            "refund", "ticket", "issue", "error code", "help", "faq", "reset password",
            "how do i", "billing problem", "account locked", "troubleshoot"
        ],
        "reasoning_math": [
            "calculate", "proof", "theorem", "probability", "derive", "matrix",
            "formula", "statistical", "benchmark", "priors", "bayesian"
        ],
        "data_extraction": [
            "json", "extract", "parse", "csv", "table", "key-value", "entity", "schema"
        ]
    }

    def classify_and_score(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Classifies prompt task and assigns a continuous complexity score [0.0 - 1.0].
        """
        full_text = " ".join([m.get("content", "") for m in messages]).lower()
        token_count = len(full_text.split())

        # 1. Match Domain
        scores = {}
        for task, keywords in self.TASK_TAXONOMY.items():
            matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', full_text))
            scores[task] = matches

        best_task = max(scores, key=scores.get) if any(scores.values()) else "general_instruction"

        # 2. Compute Complexity Score (0.0 to 1.0)
        complexity = 0.2
        if token_count > 300:
            complexity += 0.25
        elif token_count > 100:
            complexity += 0.15

        if best_task in ["code_generation", "reasoning_math"]:
            complexity += 0.35
        elif best_task in ["sales_email"]:
            complexity += 0.20
        elif best_task in ["customer_support", "data_extraction"]:
            complexity += 0.10

        # Multi-turn conversation depth
        if len(messages) > 4:
            complexity += 0.20

        complexity = min(1.0, max(0.05, complexity))

        return {
            "predicted_task": best_task,
            "complexity_score": round(complexity, 2),
            "token_estimate": token_count,
            "recommended_minimum_tier": "flagship" if complexity > 0.75 else ("mid_tier" if complexity > 0.4 else "budget")
        }

ai_classifier = ZeroShotAIClassifier()
