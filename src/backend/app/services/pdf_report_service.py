from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

from fpdf import FPDF

ROOT_DIR = Path(__file__).resolve().parents[2]
FEATURE_RU_LABELS = {
    "age": "Возраст",
    "gender": "Пол",
    "bmi": "ИМТ",
    "smoker": "Курение",
    "diabetes": "Диабет",
    "hypertension": "Гипертония",
    "heart_disease": "Болезни сердца",
    "asthma": "Астма",
    "physical_activity_level": "Уровень физической активности",
    "daily_steps": "Шагов в день",
    "sleep_hours": "Часы сна",
    "stress_level": "Уровень стресса",
    "doctor_visits_per_year": "Визитов к врачу в год",
    "hospital_admissions": "Госпитализаций",
    "medication_count": "Количество лекарств",
    "city_type": "Тип населенного пункта",
    "previous_year_cost": "Расходы за прошлый год",
}
FONT_CANDIDATES = [
    ROOT_DIR / "fonts" / "DejaVuSansCondensed.ttf",
    
    Path(__file__).resolve().parents[3] / "frontend" / "app" / "fonts" / "DejaVuSansCondensed.ttf",
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
]


def get_font_path() -> str | None:
    for path in FONT_CANDIDATES:
        if path.exists():
            return str(path)
    return None


def safe_float(value: Any, default: float = 0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except Exception:
        return default


def safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or value == "":
            return default
        return int(float(value))
    except Exception:
        return default


def format_money(value: Any) -> str:
    number = safe_float(value, 0)
    return f"{number:,.2f}".replace(",", " ")


def format_datetime(value: Any) -> str:
    if value in (None, ""):
        return "-"
    if isinstance(value, datetime):
        return value.strftime("%d.%m.%Y %H:%M")
    value_str = str(value)
    try:
        return datetime.fromisoformat(value_str.replace("Z", "+00:00")).strftime("%d.%m.%Y %H:%M")
    except Exception:
        return value_str


class PDFReport(FPDF):
    def __init__(self):
        super().__init__()
        self._font_family = "Helvetica"
        self._supports_utf8 = False

        font_path = get_font_path()
        if font_path:
            self.add_font("DejaVu", "", font_path, uni=True)
            self.add_font("DejaVu", "B", font_path, uni=True)
            self._font_family = "DejaVu"
            self._supports_utf8 = True

        self.set_font(self._font_family, "", 10)
        self.set_auto_page_break(auto=True, margin=15)

    def _txt(self, value: Any) -> str:
        text = str(value)
        if self._supports_utf8:
            return text
        return text.encode("latin-1", "replace").decode("latin-1")

    def header(self):
        self.set_font(self._font_family, "", 12)
        self.cell(0, 10, self._txt("Медицинский страховой отчёт"), 0, 1, "C")

        self.set_font(self._font_family, "", 8)
        self.cell(
            0,
            5,
            self._txt(f"Дата создания отчёта: {datetime.now().strftime('%d.%m.%Y %H:%M')}"),
            0,
            1,
            "C",
        )

        self.line(10, 20, 200, 20)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font(self._font_family, "", 8)
        self.cell(0, 10, self._txt(f"Стр. {self.page_no()}"), 0, 0, "C")

    def section_title(self, title: str):
        self.set_font(self._font_family, "B", 12)
        self.set_fill_color(230, 230, 230)
        self.cell(0, 8, self._txt(title), 0, 1, "L", 1)
        self.ln(4)

    def add_label_value(self, label: str, value: Any):
        self.set_font(self._font_family, "B", 10)
        self.cell(60, 6, self._txt(label), 0, 0)

        self.set_font(self._font_family, "", 10)

        x_start = self.get_x()
        y_start = self.get_y()

        self.set_x(x_start)
        self.multi_cell(0, 6, self._txt(value), 0, "L")

        self.set_y(max(self.get_y(), y_start + 6))


def normalize_top_factors(top_factors: Any) -> list[dict[str, Any]]:
    if not top_factors:
        return []

    def _localized_name(factor: dict[str, Any]) -> str:
        raw_name = (
            factor.get("name")
            or factor.get("feature_name")
            or factor.get("feature")
            or "-"
        )
        return FEATURE_RU_LABELS.get(str(raw_name), str(raw_name))

    def _normalize_factor(factor: dict[str, Any]) -> dict[str, Any]:
        normalized = dict(factor)
        normalized["name"] = _localized_name(normalized)
        return normalized

    if isinstance(top_factors, dict):
        return [_normalize_factor(top_factors)]
    if isinstance(top_factors, list):
        return [_normalize_factor(f) for f in top_factors if isinstance(f, dict)]
    return []


def normalize_previous_prediction(previous_prediction: Any) -> dict[str, Any] | None:
    if previous_prediction is None:
        return None
    if isinstance(previous_prediction, dict):
        return previous_prediction
    return None


def create_report_data(
    prediction: dict[str, Any],
    patient_data: dict[str, Any],
    percentile: float,
    previous_prediction: dict[str, Any] | None = None,
    top_factors: list[dict[str, Any]] | None = None,
    risk_score: float = 0.5,
    risk_category_label: str = "Стандартный",
    risk_recommendation: str = "Стандартный полис",
    final_recommendation: str = "",
) -> dict[str, Any]:
    top_factors_list = normalize_top_factors(top_factors)
    previous_dict = normalize_previous_prediction(previous_prediction)

    bmi = safe_float(patient_data.get("bmi"), 0)
    if bmi < 18.5:
        bmi_interpret = "Недостаточный вес"
    elif bmi < 25:
        bmi_interpret = "Норма"
    elif bmi < 30:
        bmi_interpret = "Избыточный вес"
    else:
        bmi_interpret = "Ожирение"

    daily_steps = safe_int(patient_data.get("daily_steps"), 0)
    steps_status = "норма" if daily_steps >= 8000 else "недостаточно"

    sleep_hours = safe_float(patient_data.get("sleep_hours"), 0)
    sleep_interpret = "норма" if sleep_hours >= 7 else "ниже нормы"

    stress = safe_int(patient_data.get("stress_level"), 5)
    if stress < 4:
        stress_interpret = "низкий"
    elif stress > 7:
        stress_interpret = "высокий"
    else:
        stress_interpret = "средний"

    active_risks = []
    risk_labels = {
        "smoker": "Курение",
        "diabetes": "Диабет",
        "hypertension": "Гипертония",
        "heart_disease": "Болезни сердца",
        "asthma": "Астма",
    }
    for key, label in risk_labels.items():
        value = patient_data.get(key, False)
        if value and str(value).lower() not in ["false", "0", "no", "none", "нет"]:
            active_risks.append(label)

    percentile_value = safe_float(percentile, 50)
    if percentile_value <= 50:
        risk_category = "Низкий"
    elif percentile_value <= 75:
        risk_category = "Стандартный"
    elif percentile_value <= 95:
        risk_category = "Высокий риск"
    else:
        risk_category = "Экстремальный риск (топ-5%)"

    trend_message = ""
    if previous_dict is not None:
        prev_cost = safe_float(previous_dict.get("predicted_cost"), 0)
        curr_cost = safe_float(prediction.get("predicted_cost"), 0)
        if curr_cost < prev_cost and prev_cost > 0:
            trend_message = f"Положительная динамика: снижение на {format_money(prev_cost - curr_cost)}"
        elif curr_cost > prev_cost:
            trend_message = f"Отрицательная динамика: рост на {format_money(curr_cost - prev_cost)}"
        else:
            trend_message = "Стабильная динамика"

    return {
        "full_name": prediction.get("full_name", "-"),
        "report_id": prediction.get("prediction_id", prediction.get("id", "-")),
        "date": datetime.now().strftime("%d.%m.%Y %H:%M"),
        "predicted_cost": safe_float(prediction.get("predicted_cost"), 0),
        "percentile": percentile_value,
        "risk_category": risk_category,
        "patient_data": {
            "age": str(patient_data.get("age", "-")),
            "gender": str(patient_data.get("gender_label", patient_data.get("gender", "-"))),
            "bmi": f"{bmi:.1f}",
            "bmi_interpret": str(bmi_interpret),
            "physical_activity": str(patient_data.get("physical_activity_label", patient_data.get("physical_activity", "-"))),
            "daily_steps": str(daily_steps),
            "steps_status": str(steps_status),
            "city_type_label": str(patient_data.get("city_type_label", "-")),
            "stress_level": str(stress),
            "stress_interpret": str(stress_interpret),
            "sleep_hours": f"{sleep_hours:.1f}",
            "sleep_interpret": str(sleep_interpret),
            "hospital_admissions": str(patient_data.get("hospital_admissions", 0)),
            "medication_count": str(patient_data.get("medication_count", 0)),
            "active_risks": active_risks,
            "smoker_status": str(patient_data.get("smoker_status", "-")),
        },
        "top_factors": top_factors_list,
        "risk_category_label": risk_category_label,
        "risk_score": safe_float(risk_score, 0.5),
        "risk_recommendation": risk_recommendation,
        "previous_prediction": previous_dict,
        "trend_message": trend_message,
        "final_recommendation": final_recommendation,
    }


def build_pdf(report_data: dict[str, Any]) -> PDFReport:
    pdf = PDFReport()
    pdf.add_page()

    pdf.section_title("1. Информация о пациенте")
    pdf.add_label_value("ФИО:", report_data.get("full_name", "-"))
    pdf.add_label_value("ID запроса:", report_data.get("report_id", "-"))
    pdf.add_label_value("Дата расчёта:", str(report_data.get("date", "-")))
    pdf.ln(5)

    pdf.section_title("2. Данные о пациенте")
    patient = report_data.get("patient_data", {}) or {}
    pdf.add_label_value("Возраст:", f"{patient.get('age', '-')} лет")
    pdf.add_label_value("Пол:", patient.get("gender", "-"))
    pdf.add_label_value("ИМТ:", f"{patient.get('bmi', '-')} ({patient.get('bmi_interpret', '-')})")
    pdf.add_label_value("Уровень физ. активности:", patient.get("physical_activity", "-"))
    pdf.add_label_value("Тип населённого пункта:", patient.get("city_type_label", "-"))
    pdf.add_label_value("Часы сна:", f"{patient.get('sleep_hours', '-')} ({patient.get('sleep_interpret', '-')})")
    pdf.add_label_value("Шагов в день:", f"{patient.get('daily_steps', '-')} ({patient.get('steps_status', '-')})")
    pdf.add_label_value("Уровень стресса:", f"{patient.get('stress_level', '-')} ({patient.get('stress_interpret', '-')})")
    pdf.add_label_value("Госпитализаций:", patient.get("hospital_admissions", "-"))
    pdf.add_label_value("Количество лекарств:", patient.get("medication_count", "-"))
    risks = patient.get("active_risks", [])
    pdf.add_label_value("Хронические заболевания:", ", ".join(risks) if risks else "нет")
    pdf.ln(5)

    pdf.section_title("3. Прогноз медицинских расходов")
    pdf.add_label_value("Прогноз на год:", f"{format_money(report_data.get('predicted_cost', 0))}")
    pdf.add_label_value("Перцентиль:", f"{safe_float(report_data.get('percentile'), 50):.0f}%")
    pdf.add_label_value("Категория:", report_data.get("risk_category", "-"))
    pdf.ln(5)

    pdf.section_title("4. Топ-3 факторов риска")
    top_factors = report_data.get("top_factors", []) or []
    if top_factors:
        for i, factor in enumerate(top_factors[:3], 1):
            pdf.set_font(pdf._font_family, "B", 10)
            pdf.cell(10, 6, str(i), 0, 0)
            pdf.set_font(pdf._font_family, "", 10)
            pdf.cell(80, 6, pdf._txt(str(factor.get("name", "-"))), 0, 0)
            impact = safe_float(factor.get("impact"), 0)
            direction = factor.get("direction", "-")
            value = safe_float(factor.get("shap_value"), 0)
            sign = "+" if direction == "increase" else "-"
            pdf.cell(0, 6, pdf._txt(f"{sign}{impact:.1f}% (вклад {value:.2f})"), 0, 1)
    else:
        pdf.add_label_value("Нет данных", "")
    pdf.ln(5)

    pdf.section_title("5. Динамика изменений прогноза")
    previous = report_data.get("previous_prediction")
    if previous is not None:
        prev_cost = safe_float(previous.get("predicted_cost"), 0)
        prev_date = format_datetime(previous.get("created_at", "-"))
        prev_id = previous.get("id", "0")
        pdf.add_label_value("Предыдущий прогноз:", f"{format_money(prev_cost)}")
        pdf.add_label_value("ID запроса:", f"{prev_id}")
        pdf.add_label_value("Дата:", str(prev_date))
        pdf.add_label_value("Изменение:", report_data.get("trend_message", "-"))
    else:
        pdf.add_label_value("В истории обращений нет записей.", "")
    pdf.ln(5)

    pdf.section_title("6. Итоговая оценка")
    pdf.add_label_value("Уровень риска:", report_data.get("risk_category_label", "-"))
    pdf.add_label_value("Численное значение:", f"{safe_float(report_data.get('risk_score'), 0):.2f}")
    pdf.add_label_value("Рекомендация:", report_data.get("final_recommendation", "-"))

    return pdf


def export_report_to_pdf_bytes(report_data: dict[str, Any]) -> bytes:
    pdf = build_pdf(report_data)
    result = pdf.output(dest="S")
    if isinstance(result, str):
        return result.encode("latin-1")
    return bytes(result)
