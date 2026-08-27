import hashlib
import time
import json
from typing import Dict, Any, Optional, Tuple

class PromptCacheService:
    """Prompt caching system saving 30-50% on token expenditure"""

    def __init__(self):
        # In-memory storage with TTL (backed by Redis in production)
        self._cache_store: Dict[str, Dict[str, Any]] = {}
        self.stats = {
            "total_lookups": 0,
            "hits": 0,
            "misses": 0,
            "tokens_saved": 0,
            "cost_saved_usd": 0.0
        }

    @staticmethod
    def compute_hash(messages: list, model: str = "") -> str:
        serialized = json.dumps([{"r": m.get("role", ""), "c": m.get("content", "").strip()} for m in messages], sort_keys=True)
        return hashlib.sha256(f"{model}:{serialized}".encode("utf-8")).hexdigest()

    def get(self, prompt_hash: str) -> Optional[Dict[str, Any]]:
        self.stats["total_lookups"] += 1
        entry = self._cache_store.get(prompt_hash)
        if not entry:
            self.stats["misses"] += 1
            return None

        # Check expiration
        if time.time() > entry["expires_at"]:
            del self._cache_store[prompt_hash]
            self.stats["misses"] += 1
            return None

        self.stats["hits"] += 1
        entry["hit_count"] += 1
        
        # Track savings
        saved_tokens = entry.get("tokens_used", 0)
        self.stats["tokens_saved"] += saved_tokens
        self.stats["cost_saved_usd"] += (saved_tokens / 1_000_000.0) * 5.0 # baseline savings

        return entry["response"]

    def set(self, prompt_hash: str, response: Dict[str, Any], model_used: str, tokens_used: int, ttl_seconds: int = 86400):
        self._cache_store[prompt_hash] = {
            "response": response,
            "model_used": model_used,
            "tokens_used": tokens_used,
            "hit_count": 0,
            "expires_at": time.time() + ttl_seconds,
            "created_at": time.time()
        }

    def get_metrics(self) -> Dict[str, Any]:
        hit_rate = (self.stats["hits"] / max(1, self.stats["total_lookups"])) * 100.0
        return {
            "total_lookups": self.stats["total_lookups"],
            "hits": self.stats["hits"],
            "misses": self.stats["misses"],
            "hit_rate_pct": round(hit_rate, 2),
            "tokens_saved": self.stats["tokens_saved"],
            "cost_saved_usd": round(self.stats["cost_saved_usd"], 4),
            "cost_saved_inr": round(self.stats["cost_saved_usd"] * 86.5, 2)
        }

cache_service = PromptCacheService()
