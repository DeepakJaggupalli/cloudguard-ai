import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine import MLEngine  # noqa: E402

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")


@pytest.fixture(scope="session")
def trained_engine():
    engine = MLEngine(DATASET_DIR)
    engine.train()
    return engine
