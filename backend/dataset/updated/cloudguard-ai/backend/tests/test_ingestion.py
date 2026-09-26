import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ingestion import TelemetryStore, REQUIRED_FIELDS


def _good_record():
    return {
        "vm_id": "vm-0001", "timestamp": "2026-01-01T00:00:00Z", "application": "payments",
        "cpu_utilization_pct": 55.0, "memory_utilization_pct": 60.0, "disk_utilization_pct": 40.0,
        "network_in_mbps": 100.0, "network_out_mbps": 120.0, "disk_iops": 1500.0,
        "latency_ms": 90.0, "packet_loss_pct": 0.1, "temperature_c": 55.0,
    }


def test_valid_record_accepted():
    store = TelemetryStore()
    status = store.ingest(_good_record())
    assert status == "valid"
    assert store.valid_count == 1
    assert store.counters()["deadLetterQueueSize"] == 0


def test_missing_field_goes_to_dlq():
    store = TelemetryStore()
    record = _good_record()
    del record["cpu_utilization_pct"]
    status = store.ingest(record)
    assert status == "malformed"
    assert store.malformed_count == 1
    assert store.counters()["deadLetterQueueSize"] == 1


def test_non_numeric_value_rejected():
    store = TelemetryStore()
    record = _good_record()
    record["latency_ms"] = "not-a-number"
    status = store.ingest(record)
    assert status == "malformed"


def test_out_of_range_value_rejected():
    store = TelemetryStore()
    record = _good_record()
    record["cpu_utilization_pct"] = 250.0
    status = store.ingest(record)
    assert status == "malformed"


def test_duplicate_record_routed_to_dlq():
    store = TelemetryStore()
    record = _good_record()
    assert store.ingest(record) == "valid"
    assert store.ingest(dict(record)) == "duplicate"
    assert store.duplicate_count == 1


def test_required_fields_cover_all_features():
    assert "vm_id" in REQUIRED_FIELDS
    assert "timestamp" in REQUIRED_FIELDS
    assert len(REQUIRED_FIELDS) >= 10
