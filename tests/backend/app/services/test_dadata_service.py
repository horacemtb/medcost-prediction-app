import os
import sys
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[4] / "src" / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.services.dadata_service import clean_full_name, clean_address, clean_phone


class DadataLiveTest(unittest.TestCase):
    """Tests that make real API calls to Dadata.
    Requires DADATA_API_KEY and DADATA_API_SECRET env vars."""

    @classmethod
    def setUpClass(cls):
        if not os.getenv("DADATA_API_KEY"):
            raise unittest.SkipTest("DADATA_API_KEY not set")

    def test_clean_full_name_normalizes_russian_name(self):
        result = clean_full_name("иванов иван иванович")
        self.assertIsNotNone(result)
        self.assertIn("Иван", result)
        self.assertIn("Иванов", result)
        self.assertNotEqual(result, "иванов иван иванович")

    def test_clean_address_standardizes_address(self):
        result = clean_address("москва тверская 1")
        self.assertIsNotNone(result)
        self.assertTrue(len(result) > 5, f"Got: {result}")

    def test_clean_phone_formats_phone(self):
        result = clean_phone("89001234567")
        self.assertIsNotNone(result)
        self.assertIn("+", result)
        self.assertNotEqual(result, "89001234567")


class DadataGracefulDegradationTest(unittest.TestCase):
    """Tests without API key (no API calls)."""

    def setUp(self):
        os.environ.pop("DADATA_API_KEY", None)
        os.environ.pop("DADATA_API_SECRET", None)

    def test_returns_none_for_empty_or_none_input(self):
        self.assertIsNone(clean_full_name(None))
        self.assertIsNone(clean_full_name(""))
        self.assertIsNone(clean_full_name("   "))
        self.assertIsNone(clean_address(None))
        self.assertIsNone(clean_address(""))
        self.assertIsNone(clean_phone(None))
        self.assertIsNone(clean_phone("   "))

    def test_returns_raw_value_when_no_api_key_set(self):
        self.assertEqual(clean_full_name("Иванов Иван"), "Иванов Иван")
        self.assertEqual(clean_phone("+79001234567"), "+79001234567")
        self.assertEqual(clean_address("г. Москва, ул. Ленина, д.1"),
                         "г. Москва, ул. Ленина, д.1")


if __name__ == "__main__":
    unittest.main()
