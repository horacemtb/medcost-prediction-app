import pandas as pd
import requests
import streamlit as st

from api_client import (
    create_prediction,
    delete_prediction,
    get_factors,
    get_history,
    healthcheck,
    get_dataset_percentile,
)

from dialogs.report_dialog import show_report_dialog

st.set_page_config(page_title="MedCost Prediction App", layout="wide")

if "last_prediction" not in st.session_state:
    st.session_state.last_prediction = None

if "factors" not in st.session_state:
    st.session_state.factors = None


def format_signed_value(value: float) -> str:
    return f"{value:+,.2f}"


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
    st.subheader("Данные пациента")

    with st.form("prediction_form"):
        col1, col2 = st.columns(2)

        with col1:
            full_name = st.text_input("ФИО пациента", placeholder="Иванов Иван Иванович")
            age = st.number_input("Возраст", min_value=18, max_value=100, value=35)

            gender_label = st.selectbox(
                "Пол",
                options=["Женский", "Мужской"],
            )

            bmi = st.number_input(
                "BMI",
                min_value=10.0,
                max_value=60.0,
                value=24.5,
                step=0.1,
            )

            physical_activity_label = st.selectbox(
                "Уровень физической активности",
                options=["Низкий", "Средний", "Высокий"],
                index=1,
            )

            city_type_label = st.selectbox(
                "Тип населённого пункта",
                options=["Город", "Пригород", "Сельская местность"],
                index=0,
            )

            daily_steps = st.number_input(
                "Шагов в день",
                min_value=0,
                max_value=50000,
                value=7000,
                step=100,
            )

            sleep_hours = st.number_input(
                "Часы сна",
                min_value=0.0,
                max_value=24.0,
                value=7.0,
                step=0.5,
            )

        with col2:
            smoker = st.checkbox("Курение")   
            diabetes = st.checkbox("Диабет")
            hypertension = st.checkbox("Гипертония")
            heart_disease = st.checkbox("Болезни сердца")
            asthma = st.checkbox("Астма")

            stress_level = st.slider("Уровень стресса", min_value=1, max_value=10, value=5)

            doctor_visits_per_year = st.number_input(
                "Визитов к врачу в год",
                min_value=0,
                max_value=100,
                value=3,
            )

            hospital_admissions = st.number_input(
                "Госпитализаций",
                min_value=0,
                max_value=50,
                value=0,
            )

            medication_count = st.number_input(
                "Количество лекарств",
                min_value=0,
                max_value=100,
                value=0,
            )

            previous_year_cost = st.number_input(
                "Расходы за прошлый год",
                min_value=0.0,
                value=10000.0,
                step=100.0,
            )



        submitted = st.form_submit_button("Рассчитать")

    if submitted:
        if not full_name.strip():
            st.warning("Укажите ФИО пациента")
        else:
            gender_mapping = {
                "Женский": 0,
                "Мужской": 1,
            }

            physical_activity_mapping = {
                "Низкий": "Low",
                "Средний": "Medium",
                "Высокий": "High",
            }

            city_type_mapping = {
                "Город": "Urban",
                "Пригород": "Semi-Urban",
                "Сельская местность": "Rural",
            }

            payload = {
                "full_name": full_name.strip(),
                "age": int(age),
                "gender": gender_mapping[gender_label],
                "bmi": float(bmi),
                "smoker": bool(smoker),
                "diabetes": bool(diabetes),
                "hypertension": bool(hypertension),
                "heart_disease": bool(heart_disease),
                "asthma": bool(asthma),
                "physical_activity_level": physical_activity_mapping[physical_activity_label],
                "daily_steps": int(daily_steps),
                "sleep_hours": float(sleep_hours),
                "stress_level": int(stress_level),
                "doctor_visits_per_year": int(doctor_visits_per_year),
                "hospital_admissions": int(hospital_admissions),
                "medication_count": int(medication_count),
                "city_type": city_type_mapping[city_type_label],
                "previous_year_cost": float(previous_year_cost),
            }

            try:
                result = create_prediction(payload)
                st.session_state.last_prediction = result
                st.session_state.factors = None
                st.session_state.last_patient_data = {
                'full_name': full_name.strip(),
                'age': int(age),
                'gender_label': gender_label,
                'bmi': float(bmi),
                'smoker': bool(smoker),
                'diabetes': bool(diabetes),
                'hypertension': bool(hypertension),
                'heart_disease': bool(heart_disease),
                'asthma': bool(asthma),
                'physical_activity_label': physical_activity_label,
                'daily_steps': int(daily_steps),
                'sleep_hours': float(sleep_hours),
                'stress_level': int(stress_level),
                'doctor_visits_per_year': int(doctor_visits_per_year),
                'hospital_admissions': int(hospital_admissions),
                'medication_count': int(medication_count),
                'city_type_label': city_type_label,
                'previous_year_cost': float(previous_year_cost)
            }
            # ========== ПОЛУЧЕНИЕ КВАНТИЛЯ ЧЕРЕЗ API ==========
                try:
                    current_prediction_value = result['predicted_cost']
                    percentile_response = get_dataset_percentile(current_prediction_value)
                    
                    result['percentile'] = percentile_response.get('percentile', 50.0)
                except requests.RequestException as exc:
                    st.warning(f"Не удалось рассчитать квантиль: {exc}")
                    st.session_state.percentile = 50.0  # Значение по умолчанию

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

            if st.button("Сформировать отчёт"):
                if st.session_state.last_prediction:
                    @st.dialog("Отчёт о прогнозе медицинских расходов", width="large")
                    def report_dialog_wrapper():
                        show_report_dialog()
                        
                    report_dialog_wrapper()
                else:
                    st.warning("Сначала выполните расчёт прогноза")
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
