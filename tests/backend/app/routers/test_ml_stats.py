import numpy as np

from app.models import SyntheticCohort
from app.routers import ml_stats


def test_calculate_percentile_returns_neutral_value_without_predictions(monkeypatch):
    monkeypatch.setattr(ml_stats, "_get_predictions", lambda: np.array([], dtype=float))

    assert ml_stats.calculate_percentile(5000.0) == 50.0


def test_calculate_percentile_uses_sorted_prediction_distribution(monkeypatch):
    monkeypatch.setattr(ml_stats, "_get_predictions", lambda: np.array([1000.0, 2000.0, 3000.0, 4000.0]))

    assert ml_stats.calculate_percentile(3000.0) == 50.0


def test_percentile_from_dataset_parses_payload(monkeypatch):
    monkeypatch.setattr(ml_stats, "calculate_percentile", lambda predicted_cost: predicted_cost / 100)

    assert ml_stats.percentile_from_dataset({"predicted_cost": "2500"}) == {"percentile": 25.0}


def test_get_predictions_reads_database_once_and_caches_sorted_values(db_session, monkeypatch):
    db_session.add_all(
        [
            SyntheticCohort(annual_medical_cost=3000.0),
            SyntheticCohort(annual_medical_cost=1000.0),
            SyntheticCohort(annual_medical_cost=None),
        ]
    )
    db_session.commit()

    monkeypatch.setattr(ml_stats, "_cached_predictions", None)
    monkeypatch.setattr(ml_stats, "SessionLocal", lambda: db_session)

    result = ml_stats._get_predictions()

    assert result.tolist() == [1000.0, 3000.0]
    assert ml_stats._get_predictions() is result
