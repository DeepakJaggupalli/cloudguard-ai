"""
Evaluation script required by the problem statement (Objective #4):
computes recall/precision on incident detection and the match rate
between suggested vs ground-truth `recommended_remediation`, and
reports a single weighted score.

Usage:
    # after unzipping the protected test set into backend/dataset/Data set/
    #   vm_monitoring_test_2000.csv
    #   vm_events_remedies_test_2000.csv
    python evaluate.py
    python evaluate.py --weight-detection 0.6 --weight-remedy 0.4
"""
import argparse
import glob
import os
import sys
import pandas as pd

from ml_engine import MLEngine
from priority_engine import PriorityEngine

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")


def find_csv(pattern: str):
    matches = glob.glob(os.path.join(DATASET_DIR, "**", pattern), recursive=True)
    return matches[0] if matches else None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weight-detection", type=float, default=0.6,
                         help="weight for detection precision/recall in the final score")
    parser.add_argument("--weight-remedy", type=float, default=0.4,
                         help="weight for remediation match-rate in the final score")
    args = parser.parse_args()

    mon_path = find_csv("vm_monitoring_test_2000.csv")
    evt_path = find_csv("vm_events_remedies_test_2000.csv")

    if not mon_path or not evt_path:
        print("ERROR: test CSVs not found under backend/dataset/.")
        print("Unzip 'test_data_protected.zip' (organizer-supplied password) into")
        print(f"  {DATASET_DIR}")
        print("producing vm_monitoring_test_2000.csv and vm_events_remedies_test_2000.csv, then re-run.")
        sys.exit(1)

    print(f"[Eval] Loading test set: {mon_path}")
    df_mon = pd.read_csv(mon_path)
    df_evt = pd.read_csv(evt_path)

    print("[Eval] Training models on the 8000-row training split...")
    engine = MLEngine(DATASET_DIR)
    engine.train()
    priority = PriorityEngine()

    # ---- 1. Incident detection: precision/recall ----
    feature_cols = engine.feature_cols
    for col in feature_cols:
        df_mon[col] = pd.to_numeric(df_mon[col], errors="coerce").fillna(df_mon[col].median())

    scores = df_mon[feature_cols].apply(lambda r: engine.predict_anomaly_score(r.to_dict()), axis=1)
    df_mon["anomaly_score"] = scores
    df_mon["predicted_incident"] = df_mon["anomaly_score"] >= priority.anomaly_threshold

    if "health_status" in df_mon.columns:
        df_mon["true_incident"] = df_mon["health_status"] != "healthy"
    else:
        # fall back: any vm_id present in the events file counts as a true incident window
        incident_vms = set(df_evt["vm_id"].unique())
        df_mon["true_incident"] = df_mon["vm_id"].isin(incident_vms)

    tp = int(((df_mon.predicted_incident) & (df_mon.true_incident)).sum())
    fp = int(((df_mon.predicted_incident) & (~df_mon.true_incident)).sum())
    fn = int(((~df_mon.predicted_incident) & (df_mon.true_incident)).sum())

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0

    print(f"[Eval] Detection  -> precision={precision:.3f} recall={recall:.3f} f1={f1:.3f} (tp={tp} fp={fp} fn={fn})")

    # ---- 2. Remediation match rate ----
    df_merged = pd.merge(df_evt, df_mon, on=["vm_id", "timestamp"], how="inner")
    if len(df_merged) < 20:
        df_merged = pd.merge(df_evt, df_mon, on="vm_id", how="inner")

    if len(df_merged) and "recommended_remedy" in df_merged.columns or "remediation_action" in df_merged.columns:
        gt_col = "remediation_action" if "remediation_action" in df_merged.columns else "target_label"
        predicted = df_merged[feature_cols].apply(lambda r: engine.predict_remediation(r.to_dict()), axis=1)

        action_display = {
            'reroute_traffic': 'Reroute Traffic & Balance Ingress',
            'restart_service': 'Restart Service Container',
            'scale_out': 'Scale Out VM Instance',
            'recycle_pool': 'Recycle DB Connection Pool',
            'expand_disk': 'Modify Storage Volume Provisioned IOPS',
            'inspect_network': 'Inspect Network Interfaces & Upstream Connectivity',
        }
        gt_display = df_merged[gt_col].map(lambda a: action_display.get(a, str(a).replace('_', ' ').title()))
        match_rate = float((predicted.values == gt_display.values).mean())
    else:
        match_rate = 0.0

    print(f"[Eval] Remediation match rate = {match_rate:.3f} (n={len(df_merged)})")

    # ---- 3. Weighted score ----
    detection_component = (precision + recall) / 2
    weighted_score = args.weight_detection * detection_component + args.weight_remedy * match_rate

    print("\n===== FINAL WEIGHTED SCORE =====")
    print(f"Detection component ({args.weight_detection:.0%}): {detection_component:.3f}")
    print(f"Remedy match component ({args.weight_remedy:.0%}): {match_rate:.3f}")
    print(f"WEIGHTED SCORE: {weighted_score:.3f}")

    results = {
        "detection_precision": round(precision, 4),
        "detection_recall": round(recall, 4),
        "detection_f1": round(f1, 4),
        "remediation_match_rate": round(match_rate, 4),
        "weighted_score": round(weighted_score, 4),
    }
    out_path = os.path.join(BASE_DIR, "eval_results.json")
    import json
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved -> {out_path}")


if __name__ == "__main__":
    main()
