from fpdf import FPDF
from datetime import datetime
import streamlit as st
import tempfile
import os
import pandas as pd
import sys
import traceback


# ========== НАСТРОЙКА ШРИФТА ==========
"""Возвращает путь к файлу шрифта DejaVuSansCondensed.ttf"""
FONT_PATH = os.path.join(os.path.dirname(__file__), "fonts", "DejaVuSansCondensed.ttf")
    # Проверяем, существует ли файл
if not os.path.exists(FONT_PATH):
    raise FileNotFoundError(
        f"Шрифт не найден по пути: {FONT_PATH}\n"
        f"Убедитесь, что файл DejaVuSansCondensed.ttf лежит в папке fonts/"
    )

def debug_print(msg, data=None):
    """Функция для отладки"""
    print(f"[DEBUG] {msg}", file=sys.stderr)
    if data is not None:
        print(f"[DEBUG]   Тип: {type(data)}", file=sys.stderr)
        if hasattr(data, 'shape'):
            print(f"[DEBUG]   Форма: {data.shape}", file=sys.stderr)
        if hasattr(data, 'empty'):
            print(f"[DEBUG]   Пустой: {data.empty}", file=sys.stderr)


class PDFReport(FPDF):

    def __init__(self):
        super().__init__()
        # Добавляем шрифт с поддержкой Unicode (кириллицы)
        self.add_font('DejaVu', '', FONT_PATH)
        self.add_font("DejaVu", "B", FONT_PATH)  # жирный
        self.set_font("DejaVu", "", 10)

        
    def header(self):
        # Логотип или заголовок
        self.set_font('DejaVu', '', 12)
        self.cell(0, 10, 'Медицинский страховой отчёт', 0, 1, 'C')
        self.set_font('DejaVu', '', 8)
        self.cell(0, 5, f'Дата создания отчёта: {datetime.now().strftime("%d.%m.%Y %H:%M")}', 0, 1, 'C')
        self.line(10, 20, 200, 20)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', '', 8)
        self.cell(0, 10, f'Стр. {self.page_no()}', 0, 0, 'C')

    def section_title(self, title):
        self.set_font('DejaVu', 'B', 12)
        self.set_fill_color(230, 230, 230)
        self.cell(0, 8, title, 0, 1, 'L', 1)
        self.ln(4)

    def add_label_value(self, label, value, x=None):
        self.set_font("DejaVu", "B", 10)
        self.cell(60, 6, str(label), 0, 0)
        
        self.set_font("DejaVu", "", 10)
        # Сохраняем текущую позицию
        x_start = self.get_x()
        y_start = self.get_y()
        
        # Используем multi_cell для длинного значения
        self.set_x(x_start)
        self.multi_cell(0, 6, str(value), 0, 'L')
        
        # Выравниваем следующую позицию
        self.set_y(max(self.get_y(), y_start + 6))

def is_valid_dict(data):
    if data is None:
        return False
    if isinstance(data, pd.DataFrame):
        return not data.empty
    if isinstance(data, dict):
        return len(data) > 0
    return False


def convert_to_dict(data):
    if data is None:
        return None
    if isinstance(data, pd.DataFrame):
        if data.empty:
            return None
        return data.iloc[0].to_dict()
    if isinstance(data, dict):
        return data
    return None
    

def export_report_to_pdf(report_data):
    """Экспорт отчёта в PDF"""
    try:
        
        pdf = PDFReport()
        pdf.add_page()
        
        # ========== 1. ШАПКА ==========
        pdf.section_title("1. Информация о пациенте")
        pdf.add_label_value("ФИО:", report_data.get('full_name', '-'))
        pdf.add_label_value("ID запроса:", report_data.get('report_id', '-'))
        date_report = report_data.get('date', '-')
        pdf.add_label_value("Дата расчёта:", str(date_report))
        pdf.ln(5)
        
        # ========== 2. ДАННЫЕ О ПАЦИЕНТЕ ==========
        pdf.section_title("2. Данные о пациенте")
        patient = report_data.get('patient_data', {})      
        pdf.add_label_value("Возраст:", f"{patient.get('age', '-')} лет")
        pdf.add_label_value("Пол:", patient.get('gender', '-'))
        pdf.add_label_value("ИМТ:", f"{patient.get('bmi', '-')} ({patient.get('bmi_interpret', '-')})")
        pdf.add_label_value("Уровень физ. активности:", patient.get('physical_activity', '-'))
        pdf.add_label_value("Тип населённого пункта:", patient.get('city_type_label', '-'))
        pdf.add_label_value("Часы сна:", f"{patient.get('sleep_hours', '-')} ({patient.get('sleep_interpret', '-')})")
        pdf.add_label_value("Шагов в день:", f"{patient.get('daily_steps', '-')} ({patient.get('steps_status', '-')})")
        pdf.add_label_value("Уровень стресса:", f"{patient.get('stress_level', '-')} ({patient.get('stress_interpret', '-')})")
        pdf.add_label_value("Госпитализаций:", patient.get('hospital_admissions', '-'))
        pdf.add_label_value("Количество лекарств:", patient.get('medication_count', '-'))
        risks = patient.get('active_risks', [])
        if risks and len(risks) > 0:
            pdf.add_label_value("Хронические заболевания:", ", ".join(risks))
        else:
            pdf.add_label_value("Хронические заболевания:", "нет")
        pdf.ln(5)
        
        # ========== 3. ПРОГНОЗ ==========
        pdf.section_title("3. Прогноз медицинских расходов")
        pdf.add_label_value("Прогноз на год:", f"{report_data.get('predicted_cost', 0):,.2f}")
        pdf.add_label_value("Перцентиль:", f"{report_data.get('percentile', 50):.0f}%")
        pdf.add_label_value("Категория:", report_data.get('risk_category', '-'))
        pdf.ln(5)
        
        # ========== 4. ТОП-3 ФАКТОРОВ ==========
        pdf.section_title("4. Топ-3 факторов риска")
        
        top_factors = report_data.get('top_factors', [])
        
        if top_factors and len(top_factors) > 0:
            for i, factor in enumerate(top_factors, 1):
                pdf.set_font("DejaVu", "B", 10)
                pdf.cell(10, 6, f"{i}.", 0, 0)
                pdf.set_font("DejaVu", "", 10)
                factor_name = factor.get('name', '-')
                pdf.cell(80, 6, str(factor_name), 0, 0)
                impact = factor.get('impact', 0)
                direction = factor.get('direction', '-')
                value = factor.get('shap_value', 0)
                if direction == 'increase':
                    pdf.cell(0, 6, f"+{impact:.1f}% (вклад {value})", 0, 1)
                else:
                    pdf.cell(0, 6, f"-{impact:.1f}% (вклад {value})", 0, 1)
        else:
            pdf.add_label_value("Нет данных", "")
        pdf.ln(5)
                
        # ========== 5. ДИНАМИКА ==========
        pdf.section_title("5. Динамика изменений прогноза")
        previous = report_data.get('previous_prediction')
        if previous is not None:
            prev_cost = previous.get('predicted_cost', 0)
            prev_date = previous.get('created_at', '-')
            prev_date = datetime.fromisoformat(prev_date).strftime("%d.%m.%Y %H:%M")
            prev_ID = previous.get('id', '0')
            pdf.add_label_value("Предыдущий прогноз:", f"{prev_cost:,.2f} ")
            pdf.add_label_value("ID запроса:", f"{prev_ID:,.0f}")
            pdf.add_label_value("Дата:", str(prev_date))
            pdf.add_label_value("Изменение:", report_data.get('trend_message', '-'))
            pdf.ln(5)
        else:
            pdf.add_label_value("В истории обращений нет записей.", '')
            pdf.ln(5)
        
        # ========== 6. ИТОГ ==========
        pdf.section_title("6. Итоговая оценка")
        pdf.set_font("DejaVu", "", 10)
        pdf.add_label_value("Уровень риска:", report_data.get('risk_level', '-'))
        pdf.add_label_value("Численное значение:", f"{report_data.get('risk_score', 0):.2f}")
        pdf.add_label_value("Рекомендация:", report_data.get('final_recommendation', '-'))
        
        # Сохраняем PDF
        pdf_content = pdf.output()
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.write(pdf_content)
        temp_file.close()
        
        return temp_file.name
        
    except Exception as e:
        print(f"ERROR: {e}")
        print(traceback.format_exc())
        raise


def create_report_data(
    prediction, 
    patient_data, 
    percentile, 
    previous_prediction=None,
    top_factors=None,
    risk_score=0.5,
    risk_level="Средний",
    risk_recommendation="Стандартный полис",
    final_recommendation=""
):
    """Формирование данных для PDF отчёта"""
    
    # ========== 1. КОНВЕРТАЦИЯ TOP_FACTORS (DataFrame → list) ==========
    top_factors_list = []
    if top_factors is not None:
        if hasattr(top_factors, 'empty'):
            if not top_factors.empty:
                for _, row in top_factors.iterrows():
                    factor = {}
                    
                    # Ищем название признака
                    if 'feature_name' in row:
                        factor['name'] = row['feature_name']
                    else:
                        factor['name'] = str(row.iloc[0]) if len(row) > 0 else '-'
                    
                    # Ищем значение
                    if 'feature_value' in row:
                        factor['value'] = row['feature_value']
                    else:
                        factor['value'] = '-'
                    
                    # Ищем вклад в процентах
                    if 'impact_pct' in row:
                        factor['impact'] = float(row['impact_pct'])
                    else:
                        factor['impact'] = 0
                        
                    if 'direction' in row:
                        factor['direction'] = row['direction']
                    else:
                        factor['direction'] = '-'

                    if 'shap_value' in row:
                        factor['shap_value'] = row['shap_value']
                    else:
                        factor['shap_value'] = 0

                    top_factors_list.append(factor)
        # Если это список
        elif isinstance(top_factors, list):
            top_factors_list = top_factors
        # Если это словарь
        elif isinstance(top_factors, dict):
            top_factors_list = [top_factors]
    
    # ========== 2. КОНВЕРТАЦИЯ PREVIOUS_PREDICTION ==========
    previous_dict = None
    if previous_prediction is not None:
        # Если это pandas DataFrame
        if hasattr(previous_prediction, 'empty'):
            if not previous_prediction.empty:
                if len(previous_prediction) > 0:
                    previous_dict = previous_prediction.iloc[0].to_dict()
        # Если это словарь
        elif isinstance(previous_prediction, dict):
            previous_dict = previous_prediction
    
    # ========== 3. ИНТЕРПРЕТАЦИЯ ДАННЫХ ==========
    # Интерпретация ИМТ
    bmi = patient_data.get('bmi', 0)
    if isinstance(bmi, str):
        try:
            bmi = float(bmi)
        except:
            bmi = 0
    
    if bmi < 18.5:
        bmi_interpret = "Недостаточный вес"
    elif bmi < 25:
        bmi_interpret = "Норма"
    elif bmi < 30:
        bmi_interpret = "Избыточный вес"
    else:
        bmi_interpret = "Ожирение"
    
    # Статус шагов
    daily_steps = patient_data.get('daily_steps', 0)
    try:
        daily_steps = int(daily_steps)
    except:
        daily_steps = 0
    steps_status = "норма" if daily_steps >= 8000 else "недостаточно"

    city_type_label = patient_data.get('city_type_label', '-')
    # Интерпретация часов сна
    sleep_hours = patient_data.get('sleep_hours', 0)
    sleep_interpret = 'норма' if sleep_hours >= 7 else 'ниже нормы'
    # Интерпретация стресса
    stress = patient_data.get('stress_level', 5)
    try:
        stress = int(stress)
    except:
        stress = 5
    
    if stress < 4:
        stress_interpret = "низкий"
    elif stress > 7:
        stress_interpret = "высокий"
    else:
        stress_interpret = "средний"
    
    # Активные риски
    active_risks = []
    risk_labels = {
        'smoker': 'Курение',
        'diabetes': 'Диабет',
        'hypertension': 'Гипертония',
        'heart_disease': 'Болезни сердца',
        'asthma': 'Астма'
    }
    for key, label in risk_labels.items():
        value = patient_data.get(key, False)
        if value and str(value).lower() not in ['false', '0', 'no']:
            active_risks.append(label)


    try:
        percentile = float(percentile)
    except:
        percentile = 50
    
    if percentile <= 50:
        risk_category = "Низкий"
    elif percentile <= 75:
        risk_category = "Стандартный"
    elif percentile <= 95:
        risk_category = "Высокий риск"
    else:
        risk_category = "Экстремальный риск (топ-5%)"
    
    # Сообщение о динамике
    trend_message = ""
    if previous_dict is not None:
        prev_cost = previous_dict.get('predicted_cost', 0)
        curr_cost = prediction.get('predicted_cost', 0)
        try:
            prev_cost = float(prev_cost)
            curr_cost = float(curr_cost)
        except:
            pass
        
        if curr_cost < prev_cost and prev_cost > 0:
            trend_message = f"Положительная динамика: снижение на {prev_cost - curr_cost:,.0f}"
        elif curr_cost > prev_cost:
            trend_message = f"Отрицательная динамика: рост на {curr_cost - prev_cost:,.0f}"
        else:
            trend_message = "Стабильная динамика"
    
    # ========== 4. ВОЗВРАТ СЛОВАРЯ ==========
    return {
        'full_name': prediction.get('full_name', '-'),
        'report_id': prediction.get('prediction_id', '-'),
        'date': datetime.now().strftime("%d.%m.%Y %H:%M"),
        'predicted_cost': prediction.get('predicted_cost', 0),
        'percentile': percentile,
        'risk_category': risk_category,
        'patient_data': {
            'age': str(patient_data.get('age', '-')),
            'gender': str(patient_data.get('gender_label', patient_data.get('gender', '-'))),
            'bmi': f"{bmi:.1f}",
            'bmi_interpret': str(bmi_interpret),
            'physical_activity': str(patient_data.get('physical_activity_label', '-')),
            'daily_steps': str(daily_steps),
            'steps_status': str(steps_status),
            'city_type_label': str(city_type_label),
            'stress_level': str(stress),
            'stress_interpret': str(stress_interpret),
            'sleep_hours': f"{sleep_hours:.1f}",
            'sleep_interpret': str(sleep_interpret),
            'hospital_admissions': str(patient_data.get('hospital_admissions', 0)),
            'medication_count': str(patient_data.get('medication_count', 0)),
            'active_risks': active_risks, 
            'smoker_status': str(patient_data.get('smoker_status', '-'))
        },
        'top_factors': top_factors_list,
        'risk_level': risk_level,
        'risk_score': risk_score,
        'risk_recommendation': risk_recommendation,
        'previous_prediction': previous_prediction,
        'trend_message': trend_message,
        'final_recommendation': final_recommendation
    }