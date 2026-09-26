import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from priority_engine import PriorityEngine
from correlation import correlate


def test_below_threshold_returns_none():
    pe = PriorityEngine()
    features = {"cpu_utilization_pct": 40, "memory_utilization_pct": 40, "latency_ms": 80}
    result = pe.classify(features, anomaly_score=0.3)
    assert result is None


def test_cross_layer_breach_forces_p1():
    pe = PriorityEngine()
    features = {
        "cpu_utilization_pct": 92, "memory_utilization_pct": 60, "disk_iops": 1000,
        "latency_ms": 500, "error_rate_pct": 8,
    }
    result = pe.classify(features, anomaly_score=0.9)
    assert result["priority"] == "P1"


def test_moderate_breach_gives_lower_priority():
    pe = PriorityEngine()
    features = {"cpu_utilization_pct": 70, "memory_utilization_pct": 55, "latency_ms": 150}
    result = pe.classify(features, anomaly_score=0.8)
    assert result["priority"] in ("P3", "P4")


def test_correlation_flags_cross_layer_when_both_breach():
    features = {
        "cpu_utilization_pct": 95, "memory_utilization_pct": 92, "latency_ms": 900,
        "error_rate_pct": 12, "disk_utilization_pct": 40,
    }
    baselines = {"cpu_utilization_pct": 45, "memory_utilization_pct": 55, "latency_ms": 90, "error_rate_pct": 0.2}
    thresholds = {"cpu_utilization_pct": 80, "memory_utilization_pct": 80, "latency_ms": 400, "error_rate_pct": 5}
    result = correlate(features, baselines, thresholds)
    assert result["crossLayerCorrelation"]["isCrossLayer"] is True
    assert len(result["rootCauseSignals"]) > 0


def test_correlation_infra_only():
    features = {"cpu_utilization_pct": 95, "memory_utilization_pct": 50, "latency_ms": 90, "error_rate_pct": 0.1}
    baselines = {"cpu_utilization_pct": 45}
    thresholds = {"cpu_utilization_pct": 80, "latency_ms": 400, "error_rate_pct": 5}
    result = correlate(features, baselines, thresholds)
    assert result["crossLayerCorrelation"]["isCrossLayer"] is False
