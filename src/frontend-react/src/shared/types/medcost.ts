export type PredictionInput = {
  full_name: string;
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
  full_name: string;
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
