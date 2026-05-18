export type PredictionInput = {
  full_name: string;
  snils?: string | null;
  phone?: string | null;
  address?: string | null;
  age: number;
  gender: number;
  bmi: number;
  smoker: boolean;
  diabetes: boolean;
  hypertension: boolean;
  heart_disease: boolean;
  asthma: boolean;
  physical_activity_level: "Low" | "Medium" | "High";
  daily_steps: number;
  sleep_hours: number;
  stress_level: number;
  doctor_visits_per_year: number;
  hospital_admissions: number;
  medication_count: number;
  city_type: "Urban" | "Semi-Urban" | "Rural";
  previous_year_cost: number;
};

export type PredictionResponse = {
  prediction_id: number;
  full_name: string;
  predicted_cost: number;
  patient_id?: number | null;
  created_at: string;
};

export type RiskFactor = {
  feature_name: string;
  feature_value: string | number;
  shap_value: number;
  direction: "increase" | "decrease";
};

export type PredictionDetailsResponse = {
  prediction_id: number;
  patient_id?: number | null;
  full_name: string;
  snils?: string | null;
  phone?: string | null;
  address?: string | null;
  age: number;
  gender: number;
  bmi: number;
  smoker: boolean;
  diabetes: boolean;
  hypertension: boolean;
  heart_disease: boolean;
  asthma: boolean;
  physical_activity_level: string;
  daily_steps: number;
  sleep_hours: number;
  stress_level: number;
  doctor_visits_per_year: number;
  hospital_admissions: number;
  medication_count: number;
  city_type: string;
  previous_year_cost: number;
  predicted_cost: number;
  created_at: string;
  risk_factors: RiskFactor[];
};

export type HistoryItem = {
  id: number;
  full_name: string;
  age: number;
  gender: number;
  predicted_cost: number;
  previous_year_cost: number;
  created_at: string;
};

export type HistoryResponse = {
  items: HistoryItem[];
  total: number;
};

export type OcrPatientFormResponse = {
  fields: Record<string, unknown>;
  raw_text: string;
  warnings: string[];
};

export type PredictionAssessmentResponse = {
  prediction_id: number;
  risk_category: string;
  percentile: number;
  recommendation_title: string;
  recommendation_description: string;
};

export type OverviewResponse = {
  synthetic: {
    // Общее количество записей в синтетической когорте.
    count: number;
    // Среднее значение годовых медицинских расходов в синтетической когорте.
    avg_annual_medical_cost: number;
    // Медиана годовых медицинских расходов в синтетической когорте.
    median_annual_medical_cost: number;
    // Количество курящих пациентов в синтетической когорте.
    smokers_count: number;
    // Количество пациентов с диабетом в синтетической когорте.
    diabetes_count: number;
    // Количество пациентов с гипертонией в синтетической когорте.
    hypertension_count: number;
    // Количество пациентов с сердечными заболеваниями в синтетической когорте.
    heart_disease_count: number;
    // Количество пациентов с астмой в синтетической когорте.
    asthma_count: number;
    // Распределение по полу: ключ — пол (или "unknown"), значение — количество.
    gender_distribution: Record<string, number>;
    annual_cost_histogram: {
      // Границы бинов гистограммы годовых расходов (обычно bins + 1 значений).
      bins: number[];
      // Количество записей в каждом бине гистограммы.
      counts: number[];
    };
  };
  predictions: {
    // Общее количество сохраненных предсказаний.
    count: number;
    // Среднее значение предсказанной стоимости.
    avg_predicted_cost: number;
    // Медиана предсказанной стоимости.
    median_predicted_cost: number;
    predicted_cost_histogram: {
      // Границы бинов гистограммы предсказанных значений.
      bins: number[];
      // Количество предсказаний в каждом бине.
      counts: number[];
    };
    top_factors: Array<{
      // Название фактора риска, который встречался в объяснениях модели.
      feature_name: string;
      // Сколько раз фактор встречался среди факторов риска.
      count: number;
    }>;
  };
};
