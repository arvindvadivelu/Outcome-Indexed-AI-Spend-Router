import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger("outcome_router.db")
DB_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_store.json")

DEFAULT_INITIAL_STATE = {
    "rules": [
        {
            "id": "rule_1",
            "name": "Cold Outbound SDR Outreach",
            "task_type": "sales_email",
            "condition_pattern": "task == 'sales_email'",
            "target_metric": "demo_booked",
            "is_active": True,
            "enabled": True,
            "priority_models": ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
            "models_priority": ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
            "fallback_model": "GPT-4o",
            "max_latency_ms": 500,
            "max_cost_usd": 0.0035,
            "min_win_rate": 0.92,
            "strategy": "outcome_optimized"
        },
        {
            "id": "rule_2",
            "name": "Code Generation & PR Review",
            "task_type": "code_generation",
            "condition_pattern": "task == 'code_generation'",
            "target_metric": "code_merged",
            "is_active": True,
            "enabled": True,
            "priority_models": ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"],
            "models_priority": ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"],
            "fallback_model": "GPT-4o",
            "max_latency_ms": 400,
            "max_cost_usd": 0.002,
            "min_win_rate": 0.88,
            "strategy": "cost_minimum"
        }
    ],
    "keys": [
        {
            "id": "key_1",
            "name": "Production Gateway Key",
            "key_prefix": "oir_live_8f9a2b",
            "environment": "live",
            "rate_limit": 600,
            "rate_limit_rpm": 600,
            "created_at": "Aug 20, 2026",
            "last_used_at": "Just now",
            "is_active": True
        }
    ],
    "contracts": [],
    "logs": []
}

class PersistentStore:
    def __init__(self):
        self.data: Dict[str, Any] = {}
        self._load()

    def _load(self):
        if os.path.exists(DB_FILE_PATH):
            try:
                with open(DB_FILE_PATH, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
                    return
            except Exception as e:
                logger.error(f"Failed to read data store from {DB_FILE_PATH}: {e}")
        self.data = dict(DEFAULT_INITIAL_STATE)
        self._save()

    def _save(self):
        try:
            with open(DB_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist data store: {e}")

    def get_rules(self) -> List[Dict[str, Any]]:
        return self.data.get("rules", [])

    def add_rule(self, rule: Dict[str, Any]):
        rules = self.data.get("rules", [])
        rules.insert(0, rule)
        self.data["rules"] = rules
        self._save()

    def delete_rule(self, rule_id: str):
        rules = [r for r in self.data.get("rules", []) if r.get("id") != rule_id]
        self.data["rules"] = rules
        self._save()

    def get_keys(self) -> List[Dict[str, Any]]:
        return self.data.get("keys", [])

    def add_key(self, key: Dict[str, Any]):
        keys = self.data.get("keys", [])
        keys.insert(0, key)
        self.data["keys"] = keys
        self._save()

    def delete_key(self, key_id: str):
        keys = [k for k in self.data.get("keys", []) if k.get("id") != key_id]
        self.data["keys"] = keys
        self._save()

    def add_auth_record(self, record: Dict[str, Any]):
        records = self.data.get("auth_records", [])
        records.insert(0, record)
        self.data["auth_records"] = records[:500]
        self._save()

    def get_auth_records(self) -> List[Dict[str, Any]]:
        return self.data.get("auth_records", [])

persistent_db = PersistentStore()
