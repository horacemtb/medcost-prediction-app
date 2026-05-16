import sys
import unittest
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[4] / "src" / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.services.ocr_service import (
    OCR_LANGUAGE,
    detect_checkbox_fields,
    parse_patient_form_text,
    validate_patient_fields,
)


class OcrTextParserTest(unittest.TestCase):
    def test_parses_russian_patient_form_text(self):
        raw_text = """
        АНКЕТА ПАЦИЕНТА
        1. ФИО пациента: Полиграф Полиграфыч
        2. СНИЛС: 941-466-113 04
        3. Адрес: г. Тамбов, ул. Пушкина-Колотушкина, д. 24, кв. 42
        4. Телефон: 88005553535
        2. Возраст: 35
        3. Пол: Мужской
        9. BMI (индекс массы тела): 24,80
        10. Уровень стресса (1-10): 5
        11. Уровень физической активности: Средний
        12. Тип населённого пункта: Город
        13. Шагов в день: 7000
        14. Часы сна: 7,00
        15. Визитов к врачу в год: 3
        16. Госпитализаций: 0
        17. Количество лекарств: 0
        18. Расходы за прошлый год (₽): 10000,00
        """

        fields, warnings = parse_patient_form_text(raw_text)

        self.assertEqual(fields["full_name"], "Полиграф Полиграфыч")
        self.assertEqual(fields["snils"], "941-466-113 04")
        self.assertEqual(fields["address"], "г. Тамбов, ул. Пушкина-Колотушкина, д. 24, кв. 42")
        self.assertEqual(fields["phone"], "88005553535")
        self.assertEqual(fields["age"], 35)
        self.assertEqual(fields["gender"], 1)
        self.assertEqual(fields["bmi"], 24.8)
        self.assertEqual(fields["stress_level"], 5)
        self.assertEqual(fields["physical_activity_level"], "Medium")
        self.assertEqual(fields["city_type"], "Urban")
        self.assertEqual(fields["daily_steps"], 7000)
        self.assertEqual(fields["sleep_hours"], 7.0)
        self.assertEqual(fields["doctor_visits_per_year"], 3)
        self.assertEqual(fields["hospital_admissions"], 0)
        self.assertEqual(fields["medication_count"], 0)
        self.assertEqual(fields["previous_year_cost"], 10000.0)
        self.assertNotIn("Уровень физической активности", " ".join(warnings))

    def test_parses_new_contact_fields_and_formats_snils(self):
        raw_text = """
        ФИО пациента: Иванов Иван Иванович
        СНИЛС: 12345678901
        Адрес: г. Воронеж, ул. Ленина, д. 10, кв. 5
        Телефон: +7 (900) 123-45-67
        """

        fields, warnings = parse_patient_form_text(raw_text)

        self.assertEqual(fields["full_name"], "Иванов Иван Иванович")
        self.assertEqual(fields["snils"], "123-456-789 01")
        self.assertEqual(fields["address"], "г. Воронеж, ул. Ленина, д. 10, кв. 5")
        self.assertEqual(fields["phone"], "+79001234567")
        self.assertNotIn("СНИЛС", " ".join(warnings))
        self.assertNotIn("Адрес", " ".join(warnings))
        self.assertNotIn("Телефон", " ".join(warnings))

    def test_skips_form_title_when_full_name_value_is_on_later_line(self):
        raw_text = """
        ФИО пациента:

        АНКЕТА ПАЦИЕНТА

        Иванов Иван Иванович

        СНИЛС: 123-456-789 01
        """

        fields, warnings = parse_patient_form_text(raw_text)

        self.assertEqual(fields["full_name"], "Иванов Иван Иванович")
        self.assertNotIn("ФИО пациента", " ".join(warnings))

    def test_uses_russian_tesseract_language_only(self):
        self.assertEqual(OCR_LANGUAGE, "rus")

    def test_parses_sleep_hours_with_ocr_separator_noise(self):
        fields, warnings = parse_patient_form_text("14. Часы сна; 7,00")

        self.assertEqual(fields["sleep_hours"], 7.0)
        self.assertNotIn("Часы сна", " ".join(warnings))

    def test_parses_sheet2_ocr_noise(self):
        raw_text = """
        ВМ! (индекс массы тела): — 27,35
        Тип населённого пункта: Село
        """

        fields, warnings = parse_patient_form_text(raw_text)

        self.assertEqual(fields["bmi"], 27.35)
        self.assertEqual(fields["city_type"], "Rural")
        self.assertNotIn("BMI", " ".join(warnings))
        self.assertNotIn("Тип населённого пункта", " ".join(warnings))

    def test_drops_values_outside_prediction_input_ranges(self):
        fields, warnings = validate_patient_fields(
            {
                "full_name": "А",
                "age": 5,
                "bmi": 80.0,
                "stress_level": 99,
                "sleep_hours": 30.0,
                "daily_steps": 7000,
                "previous_year_cost": 10000.0,
            }
        )

        self.assertNotIn("full_name", fields)
        self.assertNotIn("age", fields)
        self.assertNotIn("bmi", fields)
        self.assertNotIn("stress_level", fields)
        self.assertNotIn("sleep_hours", fields)
        self.assertEqual(fields["daily_steps"], 7000)
        self.assertEqual(fields["previous_year_cost"], 10000.0)
        self.assertIn("Возраст", " ".join(warnings))
        self.assertIn("BMI", " ".join(warnings))

    def test_keeps_valid_prediction_input_values(self):
        source_fields = {
            "full_name": "Иванов Иван",
            "age": 42,
            "gender": 1,
            "bmi": 27.35,
            "smoker": False,
            "diabetes": False,
            "hypertension": True,
            "heart_disease": False,
            "asthma": False,
            "physical_activity_level": "High",
            "daily_steps": 8500,
            "sleep_hours": 6.2,
            "stress_level": 7,
            "doctor_visits_per_year": 1,
            "hospital_admissions": 0,
            "medication_count": 2,
            "city_type": "Rural",
            "previous_year_cost": 25680.0,
            "snils": "123-456-789 01",
            "phone": "89001234567",
            "address": "г. Воронеж, ул. Ленина, д. 10",
        }

        fields, warnings = validate_patient_fields(source_fields)

        self.assertEqual(fields, source_fields)
        self.assertEqual(warnings, [])


class OcrCheckboxParserTest(unittest.TestCase):
    def test_detects_shifted_checkbox_by_ocr_word_positions(self):
        try:
            from PIL import Image, ImageDraw
        except ImportError as exc:
            raise unittest.SkipTest("Pillow is not installed") from exc

        image = Image.new("RGB", (420, 180), "white")
        draw = ImageDraw.Draw(image)
        yes_box = (235, 77, 258, 100)
        no_box = (315, 77, 338, 100)
        draw.rectangle(yes_box, outline="black", width=2)
        draw.rectangle(no_box, outline="black", width=2)
        draw.line((241, 88, 247, 94, 254, 82), fill="black", width=3)

        ocr_data = {
            "text": ["Курение", "Да", "Нет"],
            "left": [28, 270, 350],
            "top": [74, 76, 76],
            "width": [92, 24, 32],
            "height": [24, 24, 24],
            "block_num": [1, 1, 1],
            "par_num": [1, 1, 1],
            "line_num": [1, 1, 1],
        }

        fields, warnings = detect_checkbox_fields(image, ocr_data)

        self.assertTrue(fields["smoker"])
        self.assertNotIn("smoker", " ".join(warnings))


if __name__ == "__main__":
    unittest.main()
