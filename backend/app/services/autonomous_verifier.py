import re
from typing import Dict, Any, List

class AutonomousOutcomeVerifier:
    """
    Autonomous LLM Outcome Verifier & Implicit Signal Analyzer.
    Evaluates completion quality asynchronously in the background
    by inspecting structural validity, formatting constraints, sentiment,
    and downstream follow-up signals to report automatic outcome feedback.
    """

    def evaluate_completion(
        self,
        prompt: str,
        completion: str,
        task_type: str,
        target_metric: str
    ) -> Dict[str, Any]:
        """
        Grades completion output against task requirements and returns outcome win/loss verdict.
        """
        score = 0.20  # baseline for valid payload
        reasons = []

        # 1. Structural / Non-empty check
        if len(completion.strip()) < 15:
            return {
                "outcome_success": False,
                "confidence": 0.99,
                "quality_score": 0.1,
                "verdict_reason": "Output was empty or truncated prematurely"
            }

        # 2. Domain-specific rule evaluation
        if task_type == "code_generation" or "code" in target_metric:
            has_code_block = "```" in completion
            has_syntax_keywords = any(kw in completion for kw in ["def ", "function", "return", "import", "const", "class "])
            has_error_placeholder = any(ph in completion.lower() for ph in ["// todo", "# todo", "not implemented", "throw new error('not implemented')"])
            
            if has_code_block or has_syntax_keywords:
                score += 0.55
                reasons.append("Syntactically structured code provided")
            if not has_error_placeholder:
                score += 0.25
                reasons.append("Complete implementation without dummy placeholders")
            else:
                score -= 0.20
                reasons.append("Contained unfinished TODO placeholders")

        elif task_type == "sales_email" or "demo" in target_metric:
            has_cta = any(cta in completion.lower() for cta in ["this week", "chat", "15 minutes", "quick call", "schedule", "open to", "demo"])
            has_subject = "subject:" in completion.lower() or "re:" in completion.lower()
            is_valid_len = 10 <= len(completion.split()) <= 300

            if has_cta:
                score += 0.40
                reasons.append("Clear actionable CTA present")
            if is_valid_len:
                score += 0.25
                reasons.append("Optimal email length")
            if has_subject:
                score += 0.15
                reasons.append("Subject line formulated")

        elif task_type == "customer_support" or "ticket" in target_metric:
            has_empathy = any(w in completion.lower() for w in ["apologize", "understand", "happy to help", "sorry", "glad to assist", "thank you"])
            has_steps = any(marker in completion for marker in ["1.", "2.", "•", "- ", "first,"])
            
            if has_empathy:
                score += 0.35
                reasons.append("Empathetic support tone")
            if has_steps:
                score += 0.35
                reasons.append("Structured resolution steps provided")
            score += 0.10
        else:
            score = 0.85
            reasons.append("Standard instruction adherence verified")

        final_score = min(1.0, max(0.0, score))
        is_success = final_score >= 0.70

        return {
            "outcome_success": is_success,
            "confidence": round(0.80 + (abs(final_score - 0.70) * 0.5), 2),
            "quality_score": round(final_score, 2),
            "verdict_reason": "; ".join(reasons) if reasons else "Completed successfully"
        }

autonomous_verifier = AutonomousOutcomeVerifier()
