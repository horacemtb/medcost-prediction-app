import sys
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


BACKEND_ROOT = Path(__file__).resolve().parents[4] / "src" / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import Base
from app.models import PredictionRecord, SyntheticCohort
from app.routers import stats


def prediction_record(predicted_cost):
    return PredictionRecord(
        full_name="Test Patient",
        age=45,
        gender=1,
        bmi=27.5,
        smoker=False,
        diabetes=False,
        hypertension=False,
        heart_disease=False,
        asthma=False,
        physical_activity_level="Medium",
        daily_steps=6000,
        sleep_hours=7.0,
        stress_level=4,
        doctor_visits_per_year=2,
        hospital_admissions=0,
        medication_count=1,
        city_type="Urban",
        previous_year_cost=1200.0,
        predicted_cost=predicted_cost,
    )


class StatsOverviewTest(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_overview_compares_prediction_share_to_historical_90th_percentile(self):
        for cost in range(1000, 11000, 1000):
            self.db.add(SyntheticCohort(annual_medical_cost=float(cost)))
        for cost in [8500.0, 9200.0, 11000.0, 12000.0]:
            self.db.add(prediction_record(cost))
        self.db.commit()

        response = stats.overview(self.db)

        self.assertEqual(response["predictions"]["high_cost_prediction_share"], 75.0)

    def test_high_cost_prediction_share_uses_historical_90th_percentile_threshold(self):
        synthetic_values = [float(cost) for cost in range(1000, 11000, 1000)]
        pred_values = [8500.0, 9200.0, 11000.0, 12000.0]

        share = stats._compute_high_cost_prediction_share(pred_values, synthetic_values)

        self.assertEqual(share, 75.0)

    def test_high_cost_prediction_share_returns_zero_without_enough_data(self):
        self.assertEqual(stats._compute_high_cost_prediction_share([], [1000.0, 2000.0]), 0.0)
        self.assertEqual(stats._compute_high_cost_prediction_share([1200.0], []), 0.0)

    def test_high_cost_prediction_share_uses_single_historical_value_as_threshold(self):
        share = stats._compute_high_cost_prediction_share([900.0, 1100.0, 1200.0], [1000.0])

        self.assertAlmostEqual(share, 100 * 2 / 3)

    def test_high_cost_prediction_share_handles_negative_values_consistently(self):
        share = stats._compute_high_cost_prediction_share([-20.0, 90.0, 100.0], [-100.0, 0.0, 100.0])

        self.assertAlmostEqual(share, 100 * 2 / 3)


if __name__ == "__main__":
    unittest.main()
