"""
Cross-layer correlation: given a telemetry record's feature vector and
per-metric baselines, work out which VM-layer signals AND which
app-layer signals are simultaneously anomalous, and produce the
human-readable summary the frontend's IncidentDetailsDrawer /
CorrelationPanel expects.
"""

INFRA_METRICS = {
    "cpu_utilization_pct": "CPU Utilization",
    "memory_utilization_pct": "Memory Usage",
    "disk_utilization_pct": "Disk Utilization",
    "network_in_mbps": "Network In",
    "network_out_mbps": "Network Out",
    "disk_iops": "Disk IOPS",
    "packet_loss_pct": "Packet Loss",
    "temperature_c": "Temperature",
}

APP_METRICS = {
    "latency_ms": "Request Latency (p99)",
    "error_rate_pct": "HTTP 5xx Error Rate",
}

# Baselines are simple rolling medians in a real deployment; for the
# hackathon prototype we use fixed healthy-band baselines from the
# training data profile (see ml_engine.baseline_stats).


def _pct_change(value: float, baseline: float) -> str:
    if baseline == 0:
        return "n/a"
    change = (value - baseline) / baseline * 100
    sign = "+" if change >= 0 else ""
    return f"{sign}{change:.0f}%"


def correlate(features: dict, baselines: dict, breach_thresholds: dict) -> dict:
    """
    features: current telemetry values for one VM+app pair
    baselines: dict of metric -> healthy baseline value (from training data)
    breach_thresholds: dict of metric -> value above which it's "anomalous"
    Returns rootCauseSignals list + crossLayerCorrelation dict matching
    the frontend's Incident type.
    """
    root_cause_signals = []
    infra_hits, app_hits = [], []

    for metric, label in {**INFRA_METRICS, **APP_METRICS}.items():
        if metric not in features:
            continue
        value = features[metric]
        baseline = baselines.get(metric, value)
        threshold = breach_thresholds.get(metric)
        is_anomaly = threshold is not None and value >= threshold
        unit = "%" if "pct" in metric else ("ms" if metric == "latency_ms" else "")

        root_cause_signals.append({
            "metric": label,
            "value": f"{value:.1f}{unit}",
            "baseline": f"{baseline:.1f}{unit}",
            "change": _pct_change(value, baseline),
            "isAnomaly": bool(is_anomaly),
            "unit": unit,
        })

        if is_anomaly:
            if metric in INFRA_METRICS:
                infra_hits.append(f"{label} {value:.0f}{unit}")
            else:
                app_hits.append(f"{label} {value:.0f}{unit}")

    is_cross_layer = bool(infra_hits) and bool(app_hits)

    if is_cross_layer:
        summary = (
            f"Correlated infrastructure degradation: {', '.join(infra_hits)} "
            f"coinciding with application-layer impact ({', '.join(app_hits)})."
        )
    elif infra_hits:
        summary = f"Infrastructure-layer anomaly only: {', '.join(infra_hits)}. No app-layer breach detected."
    elif app_hits:
        summary = f"Application-layer anomaly only: {', '.join(app_hits)}. No infra-layer breach detected."
    else:
        summary = "Anomaly flagged by model; no individual metric crossed a hard threshold."

    return {
        "rootCauseSignals": root_cause_signals,
        "crossLayerCorrelation": {
            "vmLayer": {"metrics": infra_hits, "description": "Resource-layer signals" if infra_hits else "No infra breach"},
            "appLayer": {"metrics": app_hits, "description": "Application-layer signals" if app_hits else "No app breach"},
            "summary": summary,
            "isCrossLayer": is_cross_layer,
        },
    }
