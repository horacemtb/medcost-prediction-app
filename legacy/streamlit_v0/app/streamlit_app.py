import pandas as pd
import streamlit as st

from db import get_all_records, init_db, save_patient_record

st.set_page_config(page_title="MedCost Prediction App", layout="wide")

init_db()


def predict_demo_cost(
    age: int,
    bmi: float,
    smoker: bool,
    diabetes: bool,
    stress_level: int,
    previous_year_cost: float,
) -> float:
    """
    Временная формула-заглушка.
    Позже здесь будет реальная ML-модель.
    """
    cost = previous_year_cost * 0.6
    cost += age * 120
    cost += bmi * 90
    cost += stress_level * 250

    if smoker:
        cost += 4000

    if diabetes:
        cost += 3500

    return round(max(cost, 0), 2)


st.title("MedCost Prediction App")
st.caption("Учебный прототип системы прогнозирования медицинских расходов")

tab1, tab2 = st.tabs(["Новый расчёт", "История записей"])

with tab1:
    st.subheader("Введите данные пациента")

    with st.form("patient_form"):
        full_name = st.text_input("ФИО пациента", placeholder="Иван Иванов")
        age = st.number_input("Возраст", min_value=18, max_value=100, value=35)
        gender = st.selectbox("Пол", ["male", "female"])
        bmi = st.number_input("BMI", min_value=10.0, max_value=60.0, value=24.5, step=0.1)
        smoker = st.checkbox("Курение")
        diabetes = st.checkbox("Диабет")
        stress_level = st.slider("Уровень стресса", min_value=1, max_value=10, value=5)
        previous_year_cost = st.number_input("Расходы за прошлый год", min_value=0.0, value=10000.0, step=100.0)

        submitted = st.form_submit_button("Рассчитать и сохранить")

    if submitted:
        if not full_name.strip():
            st.warning("Пожалуйста, укажите ФИО пациента.")
        else:
            predicted_cost = predict_demo_cost(
                age=age,
                bmi=bmi,
                smoker=smoker,
                diabetes=diabetes,
                stress_level=stress_level,
                previous_year_cost=previous_year_cost,
            )

            save_patient_record(
                full_name=full_name,
                age=age,
                gender=gender,
                bmi=bmi,
                smoker=smoker,
                diabetes=diabetes,
                stress_level=stress_level,
                previous_year_cost=previous_year_cost,
                predicted_cost=predicted_cost,
            )

            st.success("Расчёт выполнен и сохранён в базу данных.")
            st.metric("Прогноз годовых медицинских расходов", f"{predicted_cost:,.2f}")

with tab2:
    st.subheader("Сохранённые записи")

    records = get_all_records()

    if not records:
        st.info("Пока нет сохранённых записей.")
    else:
        rows = []
        for r in records:
            rows.append(
                {
                    "ID": r.id,
                    "ФИО": r.full_name,
                    "Возраст": r.age,
                    "Пол": r.gender,
                    "BMI": r.bmi,
                    "Курение": r.smoker,
                    "Диабет": r.diabetes,
                    "Стресс": r.stress_level,
                    "Прошлый год": r.previous_year_cost,
                    "Прогноз": r.predicted_cost,
                    "Создано": r.created_at,
                }
            )

        df = pd.DataFrame(rows)
        st.dataframe(df, use_container_width=True)
