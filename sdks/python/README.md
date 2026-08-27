# Outcome Router Python SDK

Cut your LLM API spend by 40% while improving business outcomes.

## 5-Line Quickstart

```python
from outcome_router import OutcomeRouterClient

router = OutcomeRouterClient(api_key="oir_live_your_api_key")

# 1. Route to optimal outcome model
res = router.chat(
    messages=[{"role": "user", "content": "Write cold outreach for CTO"}],
    strategy="outcome_optimized",
    target_metric="demo_booked"
)
print("Model Picked:", res["_router_metadata"]["model_used"])
print("Dollars Saved:", res["_router_metadata"]["saved_usd"])

# 2. Record downstream conversion feedback
router.record_outcome(
    request_id=res["_router_metadata"]["request_id"],
    outcome_success=True, # e.g. lead replied or booked a demo
    metric_name="demo_booked",
    revenue_impact_usd=500.0
)
```
