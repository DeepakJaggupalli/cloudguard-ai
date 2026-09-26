"""
Telemetry ingestion layer.

Producer:  emits synthetic VM + application telemetry records continuously
           (sampled from the training CSV distribution so values stay
           realistic, with periodic injected anomalies + occasional
           malformed/duplicate records to exercise the DLQ).
Consumer:  validates each record (required fields, type/range checks),
           deduplicates by (vm_id, timestamp), persists valid records to
           the in-memory TelemetryStore, and routes anything invalid or
           duplicate to a Dead Letter Queue, incrementing counters.
"""
import asyncio
import random
import time
from collections import deque
from datetime import datetime, timezone
from typing import Optional

REQUIRED_FIELDS = [
    "vm_id", "timestamp", "application",
    "cpu_utilization_pct", "memory_utilization_pct", "disk_utilization_pct",
    "network_in_mbps", "network_out_mbps", "disk_iops",
    "latency_ms", "packet_loss_pct", "temperature_c",
]

RANGE_CHECKS = {
    "cpu_utilization_pct": (0, 100),
    "memory_utilization_pct": (0, 100),
    "disk_utilization_pct": (0, 100),
    "packet_loss_pct": (0, 100),
    "network_in_mbps": (0, 100000),
    "network_out_mbps": (0, 100000),
    "disk_iops": (0, 1000000),
    "latency_ms": (0, 60000),
    "temperature_c": (-40, 150),
}


class TelemetryStore:
    """Thread-safe-enough (single event loop) in-memory ring buffer of valid records."""

    def __init__(self, maxlen: int = 5000):
        self.records: deque = deque(maxlen=maxlen)
        self.valid_count = 0
        self.duplicate_count = 0
        self.malformed_count = 0
        self.dead_letter_queue: deque = deque(maxlen=500)
        self._seen_keys = set()

    def _dedup_key(self, record: dict):
        return (record.get("vm_id"), record.get("timestamp"))

    def validate(self, record: dict) -> Optional[str]:
        """Returns None if valid, else a reason string."""
        for field in REQUIRED_FIELDS:
            if field not in record or record[field] is None:
                return f"missing_field:{field}"
        for field, (lo, hi) in RANGE_CHECKS.items():
            try:
                val = float(record[field])
            except (TypeError, ValueError):
                return f"non_numeric:{field}"
            if val < lo or val > hi:
                return f"out_of_range:{field}={val}"
        return None

    def ingest(self, record: dict) -> str:
        """Validates, dedups, and routes a single record. Returns status string."""
        reason = self.validate(record)
        if reason:
            self.malformed_count += 1
            self.dead_letter_queue.append({"record": record, "reason": reason, "receivedAt": datetime.now(timezone.utc).isoformat()})
            return "malformed"

        key = self._dedup_key(record)
        if key in self._seen_keys:
            self.duplicate_count += 1
            self.dead_letter_queue.append({"record": record, "reason": "duplicate", "receivedAt": datetime.now(timezone.utc).isoformat()})
            return "duplicate"

        self._seen_keys.add(key)
        if len(self._seen_keys) > 20000:
            # prevent unbounded growth in long-running demo
            self._seen_keys.clear()
        self.records.append(record)
        self.valid_count += 1
        return "valid"

    def counters(self) -> dict:
        return {
            "validCount": self.valid_count,
            "duplicateCount": self.duplicate_count,
            "malformedCount": self.malformed_count,
            "deadLetterQueueSize": len(self.dead_letter_queue),
        }

    def dlq_sample(self, n: int = 20):
        return list(self.dead_letter_queue)[-n:]

    def latest(self, n: int = 20):
        return list(self.records)[-n:]


class TelemetryProducer:
    """
    Samples rows from the training dataframe to emit realistic synthetic
    telemetry, periodically injecting anomalies and (intentionally) bad
    records so the validator/DLQ path is exercised end-to-end.
    """

    def __init__(self, df_mon, anomaly_injection_rate: float = 0.08, bad_record_rate: float = 0.03):
        self.df = df_mon
        self.anomaly_injection_rate = anomaly_injection_rate
        self.bad_record_rate = bad_record_rate
        self._tick = 0

    def _inject_anomaly(self, row: dict) -> dict:
        row = dict(row)
        spike_field = random.choice(["cpu_utilization_pct", "memory_utilization_pct", "latency_ms"])
        if spike_field == "latency_ms":
            row[spike_field] = round(random.uniform(600, 1200), 1)
        else:
            row[spike_field] = round(random.uniform(88, 99), 1)
        row["latency_ms"] = row.get("latency_ms", 100)
        row["error_rate_pct"] = round(random.uniform(6, 18), 2)
        return row

    def _corrupt(self, row: dict) -> dict:
        row = dict(row)
        mode = random.choice(["missing_field", "bad_type", "out_of_range"])
        if mode == "missing_field":
            row.pop(random.choice(REQUIRED_FIELDS[3:]), None)
        elif mode == "bad_type":
            row["cpu_utilization_pct"] = "N/A"
        else:
            row["memory_utilization_pct"] = 250.0
        return row

    def next_record(self) -> dict:
        self._tick += 1
        sample = self.df.sample(1).iloc[0]
        record = {
            "vm_id": str(sample["vm_id"]),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "application": str(sample.get("application", "unknown")),
            "region": str(sample.get("region", "us-east-1")),
            "cpu_utilization_pct": float(sample["cpu_utilization_pct"]),
            "memory_utilization_pct": float(sample["memory_utilization_pct"]),
            "disk_utilization_pct": float(sample["disk_utilization_pct"]),
            "network_in_mbps": float(sample["network_in_mbps"]),
            "network_out_mbps": float(sample["network_out_mbps"]),
            "disk_iops": float(sample["disk_iops"]),
            "latency_ms": float(sample["latency_ms"]),
            "packet_loss_pct": float(sample["packet_loss_pct"]),
            "temperature_c": float(sample["temperature_c"]),
            "error_rate_pct": round(random.uniform(0.05, 0.6), 2),
        }

        if random.random() < self.anomaly_injection_rate:
            record = self._inject_anomaly(record)
        if random.random() < self.bad_record_rate:
            record = self._corrupt(record)
        return record


async def run_ingestion_loop(producer: TelemetryProducer, store: TelemetryStore, on_valid_record, interval_seconds: float = 1.5):
    """
    Background task: produce -> consume(validate/dedup) -> persist,
    and invoke on_valid_record(record) for every record that passes
    validation (used by main.py to feed the anomaly detector).
    """
    while True:
        record = producer.next_record()
        status = store.ingest(record)
        if status == "valid":
            try:
                await on_valid_record(record)
            except Exception as e:
                print(f"[Ingestion] on_valid_record handler error: {e}")
        await asyncio.sleep(interval_seconds)
