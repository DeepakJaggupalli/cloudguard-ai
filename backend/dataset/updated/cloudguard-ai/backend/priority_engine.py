"""
Rule-based business-impact priority engine.
Reads backend/config/priority_rules.yaml so ops can retune thresholds
without a code change or redeploy.
"""
import os
import yaml

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config", "priority_rules.yaml")

_OPS = {
    ">=": lambda a, b: a >= b,
    ">": lambda a, b: a > b,
    "<=": lambda a, b: a <= b,
    "<": lambda a, b: a < b,
    "==": lambda a, b: a == b,
}


class PriorityEngine:
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config_path = config_path
        self.reload()

    def reload(self):
        with open(self.config_path, "r") as f:
            cfg = yaml.safe_load(f)
        self.anomaly_threshold = cfg.get("anomaly_threshold", 0.75)
        self.rules = cfg.get("rules", [])

    def _check_conditions(self, conditions: list, features: dict) -> bool:
        for cond in conditions:
            val = features.get(cond["metric"])
            if val is None:
                continue
            op_fn = _OPS.get(cond["op"], _OPS[">="])
            if op_fn(val, cond["value"]):
                return True
        return False

    def _check_cross_layer(self, boost_cfg: dict, features: dict) -> bool:
        if not boost_cfg:
            return False
        infra_hit = any(
            features.get(m, 0) >= boost_cfg.get("infra_threshold_pct", 999)
            for m in boost_cfg.get("infra_metrics", [])
        )
        app_thresholds = boost_cfg.get("app_threshold", {})
        app_hit = any(
            features.get(m, 0) >= app_thresholds.get(m, 999999)
            for m in boost_cfg.get("app_metrics", [])
        )
        return infra_hit and app_hit

    def classify(self, features: dict, anomaly_score: float) -> dict:
        """
        Returns {"priority": "P1".."P4", "severity": str, "reason": str}
        or None if anomaly_score is below the trigger threshold.
        """
        if anomaly_score < self.anomaly_threshold:
            return None

        for rule in self.rules:
            cross_boost = rule.get("cross_layer_boost")
            if cross_boost and self._check_cross_layer(cross_boost, features):
                return {
                    "priority": rule["priority"],
                    "severity": rule["label"],
                    "reason": "Cross-layer breach: simultaneous infra + app-level anomaly",
                }
            any_of = rule.get("any_of", [])
            all_of = rule.get("all_of", [])
            matched_any = self._check_conditions(any_of, features) if any_of else False
            matched_all = all(
                self._check_conditions([c], features) for c in all_of
            ) if all_of else False

            if any_of and matched_any:
                return {"priority": rule["priority"], "severity": rule["label"], "reason": "Threshold breach"}
            if all_of and matched_all:
                return {"priority": rule["priority"], "severity": rule["label"], "reason": "Multiple thresholds breached"}
            if not any_of and not all_of:
                # fallback bucket (e.g. P4) — anomaly crossed model threshold but no hard metric breach
                return {"priority": rule["priority"], "severity": rule["label"], "reason": "Model-flagged anomaly, no hard threshold breach"}

        return {"priority": "P4", "severity": "low", "reason": "Unclassified anomaly"}
