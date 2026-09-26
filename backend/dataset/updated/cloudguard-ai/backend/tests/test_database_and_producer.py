import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from database import StateDatabase
from priority_engine import PriorityEngine
from ingestion import TelemetryProducer, TelemetryStore, REQUIRED_FIELDS


def test_database_initializes(trained_engine):
    db = StateDatabase(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset"))
    db.initialize(trained_engine)
    assert db.initialized
    assert len(db.vms) > 0
    assert len(db.applications) > 0
    assert len(db.incidents) >= 1
    assert len(db.audit_logs) >= 1


def test_create_incident_from_scoring_below_threshold_returns_none(trained_engine):
    db = StateDatabase(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset"))
    db.initialize(trained_engine)
    pe = PriorityEngine()
    healthy = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    result = db.create_incident_from_scoring("vm-9999", "payments", healthy, anomaly_score=0.1,
                                              ml_engine=trained_engine, priority_engine=pe)
    assert result is None


def test_create_incident_from_scoring_creates_p1_on_spike(trained_engine):
    db = StateDatabase(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset"))
    db.initialize(trained_engine)
    pe = PriorityEngine()
    before = len(db.incidents)
    spike = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    spike["cpu_utilization_pct"] = 96
    spike["latency_ms"] = 900
    spike["error_rate_pct"] = 12
    incident = db.create_incident_from_scoring("vm-1234", "payments", spike, anomaly_score=0.95,
                                                ml_engine=trained_engine, priority_engine=pe)
    assert incident is not None
    assert incident["priority"] in ("P1", "P2")
    assert len(db.incidents) == before + 1
    assert db.incidents[0]["id"] == incident["id"]


def test_producer_emits_required_fields(trained_engine):
    df_mon, _ = trained_engine._load_training_frames()
    producer = TelemetryProducer(df_mon, anomaly_injection_rate=0.0, bad_record_rate=0.0)
    record = producer.next_record()
    for field in REQUIRED_FIELDS:
        assert field in record


def test_producer_anomaly_injection_raises_values(trained_engine):
    df_mon, _ = trained_engine._load_training_frames()
    producer = TelemetryProducer(df_mon, anomaly_injection_rate=1.0, bad_record_rate=0.0)
    record = producer.next_record()
    spiked = record["cpu_utilization_pct"] > 85 or record["memory_utilization_pct"] > 85 or record["latency_ms"] > 500
    assert spiked


def test_producer_corruption_triggers_dlq(trained_engine):
    df_mon, _ = trained_engine._load_training_frames()
    producer = TelemetryProducer(df_mon, anomaly_injection_rate=0.0, bad_record_rate=1.0)
    store = TelemetryStore()
    for _ in range(5):
        record = producer.next_record()
        store.ingest(record)
    assert store.malformed_count + store.duplicate_count >= 1
