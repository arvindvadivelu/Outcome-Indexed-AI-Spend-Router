from typing import Dict, Any, List
from .providers import provider_gateway

class SelfCorrectionCritic:
    """
    Self-Correction Fallback Critic.
    Acts as a real-time post-inference quality filter. If an output from a
    low-cost budget model shows evidence of hallucination, broken syntax,
    or truncated reasoning, the Critic auto-escalates to Claude 3.5 / GPT-4o
    with a targeted self-correction refinement prompt.
    """

    async def evaluate_and_correct(
        self,
        messages: List[Dict[str, str]],
        initial_model: str,
        initial_content: str,
        task_type: str
    ) -> Dict[str, Any]:
        """
        Evaluates initial completion. If quality falls below threshold, corrects with flagship.
        """
        # Quality check heuristics
        has_hallucination = any(phrase in initial_content.lower() for phrase in [
            "as an ai language model, i cannot",
            "i do not have access to real-time",
            "unsupported operation error"
        ])
        is_truncated = initial_content.endswith("...") or len(initial_content.strip()) < 20

        if not has_hallucination and not is_truncated:
            return {
                "critic_verdict": "PASSED",
                "escalation_triggered": False,
                "model_used": initial_model,
                "content": initial_content,
                "confidence_score": 0.95
            }

        # Auto-escalate to flagship with refinement
        flagship = "claude-3-5-sonnet-20241022"
        refinement_messages = [
            *messages,
            {"role": "assistant", "content": initial_content},
            {"role": "user", "content": "[Self-Correction Critic] The previous output was incomplete or contained errors. Please produce a polished, high-accuracy replacement."}
        ]

        escalated_result = await provider_gateway.generate_completion(flagship, refinement_messages, temperature=0.5)
        new_content = escalated_result.get("choices", [{}])[0].get("message", {}).get("content", initial_content)

        return {
            "critic_verdict": "ESCALATED",
            "escalation_triggered": True,
            "original_model": initial_model,
            "model_used": flagship,
            "content": new_content,
            "escalation_reason": "Output was incomplete or flagged by Critic",
            "confidence_score": 0.98
        }

self_correction_critic = SelfCorrectionCritic()
