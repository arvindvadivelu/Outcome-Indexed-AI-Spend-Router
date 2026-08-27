import pytest
from app.schemas.router_schemas import ChatMessage, RoutePreferences
from app.services.router_engine import outcome_router_engine
from app.services.cache import cache_service
from app.services.compression import compression_service
from app.services.benchmarking import benchmark_service

# New AI services
from app.services.ai_classifier import ai_classifier
from app.services.synthetic_judge import synthetic_bootstrapper
from app.services.autonomous_verifier import autonomous_verifier
from app.services.policy_synthesizer import policy_synthesizer
from app.services.autopilot import budget_autopilot

@pytest.mark.asyncio
async def test_zero_shot_ai_classifier():
    res = ai_classifier.classify_and_score([
        {"role": "user", "content": "Write a TypeScript React component with async streaming"}
    ])
    assert res["predicted_task"] == "code_generation"
    assert res["complexity_score"] > 0.4
    assert res["recommended_minimum_tier"] in ["mid_tier", "flagship"]

@pytest.mark.asyncio
async def test_synthetic_judge_bootstrapper():
    res = synthetic_bootstrapper.bootstrap_model_priors("deepseek-v3", "sales_email")
    assert res["status"] == "priors_bootstrapped"
    assert "sales_email" in res["task_priors"]
    assert res["task_priors"]["sales_email"]["alpha_prior"] > 1.0

@pytest.mark.asyncio
async def test_autonomous_outcome_verifier():
    verdict = autonomous_verifier.evaluate_completion(
        prompt="Write a cold email",
        completion="Subject: Boost conversions\n\nHi John,\nLet's chat for 15 minutes this week.\n\nBest,\nAlex",
        task_type="sales_email",
        target_metric="demo_booked"
    )
    assert verdict["outcome_success"] is True
    assert verdict["confidence"] > 0.7

@pytest.mark.asyncio
async def test_natural_language_policy_synthesizer():
    policy = policy_synthesizer.synthesize_policy_from_prompt("Cut costs on customer support FAQ while keeping latency under 100ms")
    assert policy["task_type"] == "customer_support"
    assert policy["target_metric"] == "ticket_resolved"
    assert "llama-3.3-70b-versatile" in policy["priority_models"]

@pytest.mark.asyncio
async def test_budget_autopilot():
    status = budget_autopilot.compute_autopilot_status(current_spend_usd=900.0, monthly_budget_usd=1000.0, day_of_month=26)
    assert status["status"] == "active"
    assert "burn_ratio" in status
    assert "dynamic_weights" in status

@pytest.mark.asyncio
async def test_router_engine_selection():
    messages = [{"role": "user", "content": "Draft high-converting cold email for VP of Engineering"}]
    decision = await outcome_router_engine.select_optimal_model(
        messages=messages,
        strategy="outcome_optimized",
        target_metric="demo_booked"
    )
    assert "selected_model" in decision
    assert decision["selected_model"] in ["claude-3-5-sonnet-20241022", "deepseek-chat", "gpt-4o-mini"]
    assert decision["estimated_cost_saved_usd"] >= 0.0
