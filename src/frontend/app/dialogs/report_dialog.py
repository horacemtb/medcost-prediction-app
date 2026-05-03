import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
from api_client import get_last_prediction_by_name 

def get_final_recommendation(risk_profile_score, risk_profile_category, patient_data, percentile, predicted_cost):
    """Формирование детальной итоговой рекомендации"""
    recommendation_parts = []
    if risk_profile_category == "Низкий":
        recommendation_parts.append("Рекомендуется к страхованию по стандартному полису. ")
        recommendation_parts.append("Пациент демонстрирует низкий уровень медицинского риска. "
                                   "Страхование является экономически выгодным для компании.")
    elif risk_profile_category == "Средний":
        recommendation_parts.append("Рекомендуется к страхованию с повышенными условиями. ")
        recommendation_parts.append("Пациент имеет умеренный уровень риска. "
                                   "Рекомендуется применение повышающего коэффициента к базовой премии.")
    else:
        recommendation_parts.append("Не рекомендуется к стандартному страхованию. ")
        recommendation_parts.append("Пациент относится к группе высокого медицинского риска. "
                                   "Стандартное страхование экономически нецелесообразно.")
        
    return "\n".join(recommendation_parts)


def show_report_dialog():
    # Получаем данные из session_state
    prediction = st.session_state.get('last_prediction')
    patient_data = st.session_state.get('last_patient_data', {})
    factors = st.session_state.get('factors', [])

    if not prediction:
        st.warning("Нет данных для отображения. Сначала выполните расчёт прогноза.")
        if st.button("Закрыть"):
            st.rerun()
        return
    
    # Получаем предыдущую запись
    previous_prediction = None
    full_name = prediction.get('full_name', '')
    current_id = prediction.get('prediction_id', [])

    if full_name:
        try:
            previous_prediction = get_last_prediction_by_name(full_name, current_id)
        except Exception as e:
            st.warning(f"Не удалось загрузить историю: {e}")
    
    # ==================== 1. ШАПКА ОТЧЁТА ====================
# st.markdown("## Отчёт о прогнозе медицинских расходов")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f"**ФИО пациента:**  \n{prediction.get('full_name', '—')}")
    with col2:
        st.markdown(f"**ID запроса:**  \n{prediction.get('prediction_id', '—')}")
    with col3:
        created_at = prediction.get('created_at', '—')
        created_at = datetime.fromisoformat(created_at).strftime("%d.%m.%Y %H:%M")
        st.markdown(f"**Дата:**  \n{str(created_at)}")
    
    st.divider()
    
    # ==================== 2. ДАННЫЕ О ПАЦИЕНТЕ ====================
    st.markdown("## Данные о пациенте")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Возраст
        age = patient_data.get('age', '—')
        st.markdown(f"**Возраст:** {age} лет")
        
        # Пол
        gender = patient_data.get('gender_label', '—')
        st.markdown(f"**Пол:** {gender}")
        
        # ИМТ с интерпретацией
        bmi = patient_data.get('bmi', 0)
        if bmi < 18.5:
            bmi_status = "Недостаточный вес"
        elif bmi < 25:
            bmi_status = "Норма"
        elif bmi < 30:
            bmi_status = "Избыточный вес"
        else:
            bmi_status = "Ожирение"
        st.markdown(f"**ИМТ:** {bmi:.1f} — {bmi_status}")
        
        # Физическая активность
        steps = patient_data.get('daily_steps', 0)
        steps_status = "Норма" if steps >= 8000 else "Недостаточно"
        st.markdown(f"**Шагов в день:** {steps:,} — {steps_status}")
        
        activity = patient_data.get('physical_activity_label', '—')
        st.markdown(f"**Уровень физ. активности:** {activity}")
        
        # Уровень стресса
        stress = patient_data.get('stress_level', 0)
        if stress < 4:
            stress_status = "Низкий"
        elif stress <= 7:
            stress_status = "Средний"
        else:
            stress_status = "Высокий"
        st.markdown(f"**Уровень стресса:** {stress}/10 — {stress_status}")
    
    with col2:
        # Медицинские показатели (чекбоксы)
        st.markdown("**Медицинские показатели:**")
        diseases = []
        smoker_status = patient_data.get('smoker_status')
        if smoker_status != 'Никогда не курил':
            st.markdown(f"• Курение - {smoker_status}")
        if patient_data.get('diabetes'):
            diseases.append("Диабет")
        if patient_data.get('hypertension'):
            diseases.append("Гипертония")
        if patient_data.get('heart_disease'):
            diseases.append("Болезни сердца")
        if patient_data.get('asthma'):
            diseases.append("Астма")
        
        if diseases:
            for d in diseases:
                st.markdown(f"• {d}")
        else:
            st.markdown("Нет хронических заболеваний")
        
        st.markdown(f"**Госпитализаций:** {patient_data.get('hospital_admissions', 0)}")
        st.markdown(f"**Количество лекарств:** {patient_data.get('medication_count', 0)}")
    
    st.divider()
    
    # ==================== 3. ПРЕДСКАЗАННОЕ ЗНАЧЕНИЕ ====================
    st.markdown("## Прогноз расходов")
    
    predicted_cost = prediction.get('predicted_cost', 0)
    previous_cost = patient_data.get('previous_year_cost', 0)
    percentile = prediction.get('percentile', 50) 


    # Определение категории риска
    if percentile <= 50:
        risk_category = "Низкий"
    elif percentile <= 75:
        risk_category = "Стандартный"
    elif percentile <= 95:
        risk_category = "Высокий риск"
    else:
        risk_category = "Экстремальный риск (топ-5%)"
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        st.metric("Прогноз годовых расходов", f"{predicted_cost:,.2f}")
    with col2:
        st.metric("Перцентиль", f"{percentile:.0f}%")
    with col3:
        st.markdown(f"**Категория:**  \n {risk_category}")
    
    if previous_cost > 0:
        change = predicted_cost - previous_cost
        change_pct = (change / previous_cost) * 100
        if change > 0:
            st.markdown(f"**Рост расходов:** +{change:,.2f} ({change_pct:+.1f}%) по сравнению с прошлым годом (данные из анкеты)")
        else:
            st.markdown(f"**Снижение расходов:** {change:,.2f} ({change_pct:+.1f}%) по сравнению с прошлым годом (данные из анкеты)")
    
    st.divider()
    
    # ==================== 4. ТОП-3 ФАКТОРОВ РИСКА ====================
    st.markdown("## Топ-3 факторов риска")
    
    if factors:
        factors_df = pd.DataFrame(factors)
        if not factors_df.empty:
            total_impact = factors_df['shap_value'].abs().sum()

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

            factors_df['impact_pct'] = (factors_df['shap_value'].abs() / total_impact * 100) if total_impact > 0 else 0
            
            top_factors = factors_df.sort_values('shap_value', key=abs, ascending=False).head(3)
            
            for idx, row in top_factors.iterrows():
                impact_pct = row['impact_pct']
                shap_value = row['shap_value']
                
                direction = "➚ увеличивает" if shap_value > 0 else "➘ уменьшает"
                
                st.markdown(f"**• {row['feature_name']}** — {direction} риск на {impact_pct:.1f}% (вклад: {shap_value:+,.2f})")
            
        else:
            st.info("Нет данных о факторах риска")
    else:
        st.info("Факторы риска не загружены. Нажмите кнопку 'Показать топ-3 факторов риска'")
    
    st.divider()

    # ================== 5. ПОИСК ПО ИСТОРИИ ====================================
    if previous_prediction:
            st.header("История обращений")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Текущее обращение")
                st.metric("Прогноз расходов", f"{prediction.get('predicted_cost', 0):,.2f}")
                current_id = prediction.get('prediction_id', '—')
                if current_id:
                    st.caption(f"ID: {current_id}")
                current_date = prediction.get('created_at', '')
                if current_date:
                    current_date = datetime.fromisoformat(current_date).strftime("%d.%m.%Y %H:%M")
                    st.caption(f"Дата: {str(current_date)}")
                            
            with col2:
                st.subheader("Предыдущее обращение")
                prev_cost = previous_prediction.get('predicted_cost', 0)
                current_cost = prediction.get('predicted_cost', 0)
                prev_ID = previous_prediction.get('id', 0)
                st.metric(
                    "Прогноз расходов", 
                    f"{prev_cost:,.2f}"
                )
                if current_id:
                    st.caption(f"ID: {prev_ID}")
                prev_date = previous_prediction.get('created_at', '')
                
                if prev_date:
                    prev_date = datetime.fromisoformat(prev_date).strftime("%d.%m.%Y %H:%M")
                    st.caption(f"Дата: {str(prev_date)}")
            
            # Оценка динамики
            st.subheader("Оценка динамики")
            delta = abs(prev_cost - current_cost)

            if current_cost < prev_cost:
                st.success(f"""
                ➘ Прогнозируемые расходы снизились на **{delta:,.0f}**
                """)
            elif current_cost > prev_cost:
                st.error(f"""
                ➚ Прогнозируемые расходы выросли на **{delta:,.0f}**
                """)
            else:
                st.info("**Стабильная динамика** — прогноз не изменился")
        
    else:
        if full_name:
            st.info(f"В истории нет записей для  пациента **{full_name}**.")

    st.divider()

    # ==================== РАСЧЁТ КОЭФФИЦИЕНТА РИСКА ====================
    st.markdown("## Итоговая оценка")
    
    # 1. ML Risk
    ml_risk = percentile / 100
    # 2. Курение
    smoking_adjustment = 0
    if smoker_status == 'Бросил в этом году':
        smoking_adjustment = 0.08
    elif smoker_status == "Бросил 1-2 года назад":
        smoking_adjustment = 0.04
    elif smoker_status == "Бросил больше 3-х лет назад":
        smoking_adjustment = 0.02
    # 3. Учёт динамики расходов
    if previous_prediction and prev_cost > 0:
        cost_change_pct = (current_cost - prev_cost) / prev_cost
        if cost_change_pct > 0.2:  # выросли больше чем на 20%
            trend_adjustment = 0.08
        elif cost_change_pct < -0.2:  # снизились больше чем на 20%
            trend_adjustment = -0.08
        else:
            trend_adjustment = 0
    else:
        trend_adjustment = 0


    # raw_risk
    raw_risk = ml_risk + smoking_adjustment + trend_adjustment
    raw_risk = max(0.05, raw_risk)
    
    # Risk Profile (логистическая функция)
    risk_profile_score = 1 / (1 + np.exp(-6 * (raw_risk - 0.5)))
    
    # Определение категории риск-профиля
    if risk_profile_score < 0.5:
        risk_profile_category = "Низкий"
        risk_profile_text = "Стандартный полис"
    elif risk_profile_score < 0.90:
        risk_profile_category = "Средний"
        risk_profile_text = "Повышенный коэффициент / одобрение с условиями"
    else:
        risk_profile_category = "Высокий"
        risk_profile_text = "Отказ / повышенная премия / обязательный доп. осмотр"
    

    final_recommendation = get_final_recommendation(
                    risk_profile_score=risk_profile_score,
                    risk_profile_category=risk_profile_category,
                    patient_data=patient_data,
                    percentile=percentile,
                    predicted_cost=prediction.get('predicted_cost', 0)
                )
    st.markdown(f"**Коэффициент риска:** {risk_profile_score:.2f}")
    st.markdown(f"**Категория:** {risk_profile_category}")
    # st.markdown(f"**Рекомендация:** {risk_profile_text}")
    st.markdown(f"**Итоговая рекомендация:** {final_recommendation}")
    
   
    st.divider()

    
    # ==================== 8. КНОПКА ЭКСПОРТА ====================
    st.subheader("Экспорт отчёта")

# Подготовка данных для PDF
    if st.button("Сохранить отчёт в PDF", type="primary"):
        try:
            from pdf_export import export_report_to_pdf, create_report_data

            # Собираем данные для отчёта
            report_data = create_report_data(
                prediction=prediction,
                patient_data=patient_data,
                percentile=percentile,
                previous_prediction=previous_prediction,
                top_factors=top_factors,  # ваш список топ-3 факторов
                risk_score=risk_profile_score,
                risk_level=risk_profile_category,
                risk_recommendation=risk_profile_text,
                final_recommendation=final_recommendation
            )

            pdf_path = export_report_to_pdf(report_data)
            
            with open(pdf_path, "rb") as pdf_file:
                st.download_button(
                    label="Скачать PDF файл",
                    data=pdf_file,
                    file_name=f"medical_report_{prediction.get('full_name', 'patient')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                    mime="application/pdf"
                )
            
            # Удаляем временный файл
            import os
            os.unlink(pdf_path)
            
        except Exception as e:
            st.error(f"Ошибка при создании PDF: {e}")
        
    # Кнопка закрытия
    st.markdown("---")
    if st.button("Закрыть отчёт", use_container_width=True):
        st.rerun()