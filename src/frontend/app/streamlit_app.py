import pandas as pd
import requests
import streamlit as st

from api_client import (
    create_prediction,
    delete_prediction,
    get_factors,
    get_history,
    healthcheck,
    recognize_patient_form,
)

st.set_page_config(page_title="MedCost Prediction App", layout="wide")

if "last_prediction" not in st.session_state:
    st.session_state.last_prediction = None

if "factors" not in st.session_state:
    st.session_state.factors = None

if "ocr_warnings" not in st.session_state:
    st.session_state.ocr_warnings = []

if "ocr_raw_text" not in st.session_state:
    st.session_state.ocr_raw_text = ""


GENDER_OPTIONS = ["Женский", "Мужской"]
PHYSICAL_ACTIVITY_OPTIONS = ["Низкий", "Средний", "Высокий"]
CITY_TYPE_OPTIONS = ["Город", "Пригород", "Сельская местность"]

GENDER_TO_BACKEND = {
    "Женский": 0,
    "Мужской": 1,
}
BACKEND_TO_GENDER = {value: key for key, value in GENDER_TO_BACKEND.items()}

PHYSICAL_ACTIVITY_TO_BACKEND = {
    "Низкий": "Low",
    "Средний": "Medium",
    "Высокий": "High",
}
BACKEND_TO_PHYSICAL_ACTIVITY = {value: key for key, value in PHYSICAL_ACTIVITY_TO_BACKEND.items()}

CITY_TYPE_TO_BACKEND = {
    "Город": "Urban",
    "Пригород": "Semi-Urban",
    "Сельская местность": "Rural",
}
BACKEND_TO_CITY_TYPE = {value: key for key, value in CITY_TYPE_TO_BACKEND.items()}


def format_signed_value(value: float) -> str:
    return f"{value:+,.2f}"


def ensure_form_defaults() -> None:
    defaults = {
        "full_name": "",
        "age": 35,
        "gender_label": "Женский",
        "bmi": 24.5,
        "physical_activity_label": "Средний",
        "city_type_label": "Город",
        "daily_steps": 7000,
        "sleep_hours": 7.0,
        "smoker": False,
        "diabetes": False,
        "hypertension": False,
        "heart_disease": False,
        "asthma": False,
        "stress_level": 5,
        "doctor_visits_per_year": 3,
        "hospital_admissions": 0,
        "medication_count": 0,
        "previous_year_cost": 10000.0,
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


def apply_ocr_fields(fields: dict) -> None:
    string_fields = {"full_name"}
    int_fields = {
        "age",
        "daily_steps",
        "stress_level",
        "doctor_visits_per_year",
        "hospital_admissions",
        "medication_count",
    }
    float_fields = {"bmi", "sleep_hours", "previous_year_cost"}
    bool_fields = {"smoker", "diabetes", "hypertension", "heart_disease", "asthma"}

    for field_name in string_fields:
        if field_name in fields:
            st.session_state[field_name] = str(fields[field_name])

    for field_name in int_fields:
        if field_name in fields:
            st.session_state[field_name] = int(fields[field_name])

    for field_name in float_fields:
        if field_name in fields:
            st.session_state[field_name] = float(fields[field_name])

    for field_name in bool_fields:
        if field_name in fields:
            st.session_state[field_name] = bool(fields[field_name])

    if "gender" in fields:
        st.session_state.gender_label = BACKEND_TO_GENDER.get(fields["gender"], st.session_state.gender_label)
    if "physical_activity_level" in fields:
        st.session_state.physical_activity_label = BACKEND_TO_PHYSICAL_ACTIVITY.get(
            fields["physical_activity_level"],
            st.session_state.physical_activity_label,
        )
    if "city_type" in fields:
        st.session_state.city_type_label = BACKEND_TO_CITY_TYPE.get(fields["city_type"], st.session_state.city_type_label)


def build_prediction_payload() -> dict:
    return {
        "full_name": st.session_state.full_name.strip(),
        "age": int(st.session_state.age),
        "gender": GENDER_TO_BACKEND[st.session_state.gender_label],
        "bmi": float(st.session_state.bmi),
        "smoker": bool(st.session_state.smoker),
        "diabetes": bool(st.session_state.diabetes),
        "hypertension": bool(st.session_state.hypertension),
        "heart_disease": bool(st.session_state.heart_disease),
        "asthma": bool(st.session_state.asthma),
        "physical_activity_level": PHYSICAL_ACTIVITY_TO_BACKEND[st.session_state.physical_activity_label],
        "daily_steps": int(st.session_state.daily_steps),
        "sleep_hours": float(st.session_state.sleep_hours),
        "stress_level": int(st.session_state.stress_level),
        "doctor_visits_per_year": int(st.session_state.doctor_visits_per_year),
        "hospital_admissions": int(st.session_state.hospital_admissions),
        "medication_count": int(st.session_state.medication_count),
        "city_type": CITY_TYPE_TO_BACKEND[st.session_state.city_type_label],
        "previous_year_cost": float(st.session_state.previous_year_cost),
    }


ensure_form_defaults()

st.title("MedCost Prediction App")
st.caption("Прототип аналитической системы для прогноза медицинских расходов")

with st.sidebar:
    st.subheader("Состояние сервисов")
    try:
        status = healthcheck()
        st.success(f"Backend: {status['status']}")
    except requests.RequestException as exc:
        st.error(f"Backend недоступен: {exc}")

tab_predict, tab_history = st.tabs(["Новый расчёт", "История"])

with tab_predict:
    title_col, ocr_col = st.columns([3, 1])

    with title_col:
        st.subheader("Данные пациента")

    with ocr_col:
        with st.popover("✨ Распознать анкету"):
            uploaded_form = st.file_uploader(
                "Загрузите русскую анкету",
                type=["png", "jpg", "jpeg"],
            )
            recognize_clicked = st.button("Распознать", disabled=uploaded_form is None)

            if recognize_clicked and uploaded_form is not None:
                try:
                    ocr_result = recognize_patient_form(
                        uploaded_form.name,
                        uploaded_form.getvalue(),
                        uploaded_form.type,
                    )
                    apply_ocr_fields(ocr_result.get("fields", {}))
                    st.session_state.ocr_warnings = ocr_result.get("warnings", [])
                    st.session_state.ocr_raw_text = ocr_result.get("raw_text", "")
                    st.rerun()
                except requests.RequestException as exc:
                    st.error(f"Ошибка распознавания анкеты: {exc}")

    if st.session_state.ocr_warnings:
        with st.expander("Предупреждения OCR"):
            for warning in st.session_state.ocr_warnings:
                st.warning(warning)

    with st.form("prediction_form"):
        col1, col2 = st.columns(2)

        with col1:
            full_name = st.text_input("ФИО пациента", placeholder="Иванов Иван Иванович", key="full_name")
            age = st.number_input("Возраст", min_value=18, max_value=100, key="age")

            gender_label = st.selectbox(
                "Пол",
                options=GENDER_OPTIONS,
                key="gender_label",
            )

            bmi = st.number_input(
                "BMI",
                min_value=10.0,
                max_value=60.0,
                step=0.1,
                key="bmi",
            )

            physical_activity_label = st.selectbox(
                "Уровень физической активности",
                options=PHYSICAL_ACTIVITY_OPTIONS,
                key="physical_activity_label",
            )

            city_type_label = st.selectbox(
                "Тип населённого пункта",
                options=CITY_TYPE_OPTIONS,
                key="city_type_label",
            )

            daily_steps = st.number_input(
                "Шагов в день",
                min_value=0,
                max_value=50000,
                step=100,
                key="daily_steps",
            )

            sleep_hours = st.number_input(
                "Часы сна",
                min_value=0.0,
                max_value=24.0,
                step=0.5,
                key="sleep_hours",
            )

        with col2:
            smoker = st.checkbox("Курение", key="smoker")
            diabetes = st.checkbox("Диабет", key="diabetes")
            hypertension = st.checkbox("Гипертония", key="hypertension")
            heart_disease = st.checkbox("Болезни сердца", key="heart_disease")
            asthma = st.checkbox("Астма", key="asthma")

            stress_level = st.slider("Уровень стресса", min_value=1, max_value=10, key="stress_level")

            doctor_visits_per_year = st.number_input(
                "Визитов к врачу в год",
                min_value=0,
                max_value=100,
                key="doctor_visits_per_year",
            )

            hospital_admissions = st.number_input(
                "Госпитализаций",
                min_value=0,
                max_value=50,
                key="hospital_admissions",
            )

            medication_count = st.number_input(
                "Количество лекарств",
                min_value=0,
                max_value=100,
                key="medication_count",
            )

            previous_year_cost = st.number_input(
                "Расходы за прошлый год",
                min_value=0.0,
                step=100.0,
                key="previous_year_cost",
            )

        submitted = st.form_submit_button("Рассчитать")

    if submitted:
        if not st.session_state.full_name.strip():
            st.warning("Укажите ФИО пациента")
        else:
            try:
                payload = build_prediction_payload()
                result = create_prediction(payload)
                st.session_state.last_prediction = result
                st.session_state.factors = None
                st.success("Прогноз рассчитан и сохранён в БД")
            except requests.RequestException as exc:
                st.error(f"Ошибка при расчёте прогноза: {exc}")

    if st.session_state.last_prediction:
        st.divider()
        st.subheader("Результат")

        result = st.session_state.last_prediction

        result_col1, result_col2 = st.columns([1, 2])

        with result_col1:
            st.metric("Прогноз годовых расходов", f"{result['predicted_cost']:,.2f}")

        with result_col2:
            st.write(f"**Пациент:** {result['full_name']}")
            st.write(f"**ID прогноза:** {result['prediction_id']}")

        if st.button("Показать топ-3 факторов риска"):
            try:
                st.session_state.factors = get_factors(result["prediction_id"])
            except requests.RequestException as exc:
                st.error(f"Ошибка при получении факторов: {exc}")

        if st.session_state.factors:
            st.markdown("### Топ-3 факторов риска")

            factors_df = pd.DataFrame(st.session_state.factors)

            if "feature_name" in factors_df.columns:
                factors_df["feature_name"] = factors_df["feature_name"].replace(
                    {
                        "age": "Возраст",
                        "gender": "Пол",
                        "bmi": "BMI",
                        "smoker": "Курение",
                        "diabetes": "Диабет",
                        "hypertension": "Гипертония",
                        "heart_disease": "Болезни сердца",
                        "asthma": "Астма",
                        "physical_activity_level": "Физическая активность",
                        "daily_steps": "Шагов в день",
                        "sleep_hours": "Часы сна",
                        "stress_level": "Уровень стресса",
                        "doctor_visits_per_year": "Визитов к врачу в год",
                        "hospital_admissions": "Госпитализаций",
                        "medication_count": "Количество лекарств",
                        "city_type": "Тип населённого пункта",
                        "previous_year_cost": "Расходы за прошлый год",
                    }
                )

            if "feature_value" in factors_df.columns:
                factors_df["feature_value"] = factors_df["feature_value"].astype(str)

            if "shap_value" in factors_df.columns:
                factors_df["shap_value"] = factors_df["shap_value"].apply(format_signed_value)

            factors_df = factors_df.rename(
                columns={
                    "feature_name": "Признак",
                    "feature_value": "Значение",
                    "shap_value": "Вклад в прогноз",
                }
            )

            factor_columns = ["Признак", "Значение", "Вклад в прогноз"]
            existing_factor_columns = [col for col in factor_columns if col in factors_df.columns]

            st.table(factors_df[existing_factor_columns])
    else:
        st.info("После расчёта здесь появится прогноз и объяснение.")

with tab_history:
    st.subheader("История прогнозов")

    col1, col2 = st.columns([2, 1])

    with col1:
        search = st.text_input("Поиск по ФИО или ID")

    with col2:
        sort_display_to_backend = {
            "Дата": "created_at",
            "Прогноз": "predicted_cost",
            "Возраст": "age",
        }
        sort_by_display = st.selectbox("Сортировка", list(sort_display_to_backend.keys()))
        sort_order_display = st.selectbox(
            "Порядок",
            ["Сначала новые / большие", "Сначала старые / меньшие"],
        )

    try:
        history = get_history(search=search if search else None)
        items = history.get("items", [])

        if items:
            df = pd.DataFrame(items)

            if "created_at" in df.columns:
                df["created_at"] = pd.to_datetime(df["created_at"])

            sort_by = sort_display_to_backend[sort_by_display]
            ascending = sort_order_display == "Сначала старые / меньшие"
            df = df.sort_values(sort_by, ascending=ascending)

            if "gender" in df.columns:
                df["gender"] = df["gender"].map(
                    {
                        0: "Женский",
                        1: "Мужской",
                    }
                )

            if "created_at" in df.columns:
                df["created_at"] = df["created_at"].dt.strftime("%d.%m.%Y %H:%M")

            rename_columns = {
                "id": "ID",
                "full_name": "ФИО",
                "age": "Возраст",
                "gender": "Пол",
                "predicted_cost": "Прогноз расходов",
                "previous_year_cost": "Расходы за прошлый год",
                "created_at": "Дата расчёта",
            }

            df_display = df.rename(columns=rename_columns)

            display_columns = [
                "ID",
                "ФИО",
                "Возраст",
                "Пол",
                "Прогноз расходов",
                "Расходы за прошлый год",
                "Дата расчёта",
            ]

            existing_columns = [col for col in display_columns if col in df_display.columns]

            st.dataframe(df_display[existing_columns], use_container_width=True, hide_index=True)

            delete_options = {
                f"#{row['id']} — {row['full_name']} ({row['predicted_cost']:.2f})": row["id"]
                for row in items
            }

            selected_label = st.selectbox(
                "Удалить запись",
                options=["Не выбрано", *delete_options.keys()],
            )

            if selected_label != "Не выбрано":
                prediction_id = delete_options[selected_label]

                if st.button("Удалить выбранный прогноз"):
                    try:
                        response = delete_prediction(prediction_id)
                        st.success(response["message"])
                        st.rerun()
                    except requests.RequestException as exc:
                        st.error(f"Ошибка удаления: {exc}")
        else:
            st.info("По запросу ничего не найдено.")

    except requests.RequestException as exc:
        st.error(f"Ошибка загрузки истории: {exc}")
