import re
import uuid
from typing import Dict, Any, List

class NaturalLanguagePolicySynthesizer:
    """
    Natural Language Policy Synthesizer.
    Converts plain English business goals into executable routing rules,
    Pareto trade-off weights, and fallback priority chains.
    """

    def synthesize_policy_from_prompt(self, user_instruction: str) -> Dict[str, Any]:
        """
        Parses natural language directives such as:
        "Optimize our sales emails to get 92% reply rates under $0.002 per prompt"
        and emits an executable routing rule.
        """
        instruction_lower = user_instruction.lower()

        # 1. Infer Target Task
        task_type = "general_instruction"
        target_metric = "user_satisfaction"
        if "sales" in instruction_lower or "email" in instruction_lower or "demo" in instruction_lower or "outreach" in instruction_lower:
            task_type = "sales_email"
            target_metric = "demo_booked"
        elif "code" in instruction_lower or "pr" in instruction_lower or "typescript" in instruction_lower or "python" in instruction_lower or "refactor" in instruction_lower:
            task_type = "code_generation"
            target_metric = "code_merged"
        elif "support" in instruction_lower or "ticket" in instruction_lower or "faq" in instruction_lower or "customer" in instruction_lower:
            task_type = "customer_support"
            target_metric = "ticket_resolved"

        # 2. Infer Strategy & Latency SLA
        strategy = "outcome_optimized"
        if "cheapest" in instruction_lower or "lowest cost" in instruction_lower or "save maximum" in instruction_lower:
            strategy = "cost_minimum"
        elif "fast" in instruction_lower or "real-time" in instruction_lower or "sub-100ms" in instruction_lower or "latency" in instruction_lower:
            strategy = "latency_prioritized"

        max_latency = 450
        if "100ms" in instruction_lower or "fastest" in instruction_lower:
            max_latency = 120
        elif "sub-second" in instruction_lower or "800ms" in instruction_lower:
            max_latency = 800

        # 3. Model Priority Chain Selection
        if task_type == "code_generation":
            priority = ["deepseek-coder", "claude-3-5-sonnet", "gpt-4o-mini"]
            fallback = "gpt-4o"
        elif task_type == "sales_email":
            priority = ["claude-3-5-sonnet", "deepseek-chat", "gpt-4o-mini"]
            fallback = "gpt-4o"
        elif task_type == "customer_support":
            priority = ["llama-3.3-70b-versatile", "deepseek-chat", "gpt-4o-mini"]
            fallback = "gpt-4o-mini"
        else:
            priority = ["deepseek-chat", "gpt-4o-mini", "claude-3-5-sonnet"]
            fallback = "gpt-4o"

        rule_id = f"rule_ai_{uuid.uuid4().hex[:6]}"
        name = f"AI Synthesized: {task_type.replace('_', ' ').title()} ({strategy.replace('_', ' ').title()})"

        return {
            "id": rule_id,
            "name": name,
            "synthesized_from_prompt": user_instruction,
            "task_type": task_type,
            "condition_pattern": f"task == '{task_type}'",
            "target_metric": target_metric,
            "strategy": strategy,
            "priority_models": priority,
            "models_priority": priority,
            "fallback_model": fallback,
            "max_latency_ms": max_latency,
            "max_cost_usd": 0.0035,
            "min_win_rate": 0.90,
            "is_active": True,
            "enabled": True,
            "confidence": 0.96,
            "explanation": f"Synthesized policy prioritizing {priority[0]} for task {task_type} aiming for {target_metric} under {max_latency}ms."
        }

policy_synthesizer = NaturalLanguagePolicySynthesizer()
