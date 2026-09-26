def test_model_trains(trained_engine):
    assert trained_engine.is_trained
    assert trained_engine.isolation_forest is not None
    assert trained_engine.remediation_classifier is not None
    assert trained_engine.samples_count > 0


def test_anomaly_score_in_range(trained_engine):
    healthy = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    score = trained_engine.predict_anomaly_score(healthy)
    assert 0.0 <= score <= 1.0


def test_anomaly_score_higher_for_spike(trained_engine):
    healthy = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    spike = dict(healthy)
    spike["cpu_utilization_pct"] = 99.0
    spike["memory_utilization_pct"] = 97.0
    spike["latency_ms"] = 950.0

    score_healthy = trained_engine.predict_anomaly_score(healthy)
    score_spike = trained_engine.predict_anomaly_score(spike)
    assert score_spike >= score_healthy


def test_predict_remediation_returns_string(trained_engine):
    healthy = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    action = trained_engine.predict_remediation(healthy)
    assert isinstance(action, str)
    assert len(action) > 0


def test_retrain_returns_before_after_metrics(trained_engine):
    result = trained_engine.retrain_model()
    assert "precision" in result and "recall" in result and "f1_score" in result
    assert "precision_before" in result
    assert result["version"] != "v1.0.0" or result["samples_trained"] > 0


def test_feedback_buffer_incorporated_on_retrain(trained_engine):
    healthy = {col: trained_engine.baseline_stats.get(col, 50.0) for col in trained_engine.feature_cols}
    trained_engine.record_feedback(healthy, is_true_positive=False)
    before_samples = trained_engine.samples_count
    result = trained_engine.retrain_model()
    assert result["feedback_incorporated"] == 1
    assert trained_engine.samples_count >= before_samples
