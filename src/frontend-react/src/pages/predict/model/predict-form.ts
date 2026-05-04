import type { PredictionInput } from "../../../shared/types/medcost";
import type { PredictionDetailsResponse } from "../../../shared/types/medcost";

export const predictTabs = ["Пациент", "Образ жизни", "Факторы", "Расходы"] as const;

export type PredictTabId = (typeof predictTabs)[number];

export const initialPredictForm = {
  full_name: "",
  age: 35,
  gender: "Женский",
  bmi: 24.5,
  smoker: false,
  diabetes: false,
  hypertension: false,
  heart_disease: false,
  asthma: false,
  physical_activity_label: "Средний",
  daily_steps: 7000,
  sleep_hours: 7,
  stress_level: 5,
  doctor_visits_per_year: 3,
  hospital_admissions: 0,
  medication_count: 0,
  city_type_label: "Город",
  previous_year_cost: 10000,
};

export type PredictFormState = typeof initialPredictForm;
export type PredictFormErrors = Partial<Record<keyof PredictFormState, string>>;

export function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseMoney(value: string) {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export function validatePredictForm(values: PredictFormState): PredictFormErrors {
  const next: PredictFormErrors = {};
  const fullName = normalizeName(values.full_name);
  if (!fullName || fullName.length < 5) next.full_name = "Укажите полное ФИО (минимум 5 символов).";
  if (values.age < 18 || values.age > 100) next.age = "Возраст должен быть от 18 до 100.";
  if (values.bmi < 10 || values.bmi > 60) next.bmi = "ИМТ должен быть в диапазоне 10–60.";
  if (values.daily_steps < 0 || values.daily_steps > 50000) next.daily_steps = "Шагов в день должно быть 0–50000.";
  if (values.sleep_hours < 0 || values.sleep_hours > 24) next.sleep_hours = "Сон должен быть в диапазоне 0–24 часов.";
  if (values.stress_level < 1 || values.stress_level > 10) next.stress_level = "Стресс должен быть в диапазоне 1–10.";
  if (values.previous_year_cost < 0) next.previous_year_cost = "Расходы не могут быть отрицательными.";
  return next;
}

export function toPredictionPayload(form: PredictFormState): PredictionInput {
  const gender = form.gender === "Мужской" ? 1 : 0;
  const physical_activity_level =
    form.physical_activity_label === "Высокий"
      ? "High"
      : form.physical_activity_label === "Низкий"
        ? "Low"
        : "Medium";
  const city_type =
    form.city_type_label === "Пригород"
      ? "Semi-Urban"
      : form.city_type_label === "Сельская местность"
        ? "Rural"
        : "Urban";

  return {
    full_name: form.full_name,
    age: form.age,
    gender,
    bmi: form.bmi,
    smoker: form.smoker,
    diabetes: form.diabetes,
    hypertension: form.hypertension,
    heart_disease: form.heart_disease,
    asthma: form.asthma,
    physical_activity_level,
    daily_steps: form.daily_steps,
    sleep_hours: form.sleep_hours,
    stress_level: form.stress_level,
    doctor_visits_per_year: form.doctor_visits_per_year,
    hospital_admissions: form.hospital_admissions,
    medication_count: form.medication_count,
    city_type,
    previous_year_cost: form.previous_year_cost,
  };
}

export function mapPredictionDetailsToForm(details: PredictionDetailsResponse): PredictFormState {
  return {
    full_name: details.full_name,
    age: details.age,
    gender: details.gender === 1 ? "Мужской" : "Женский",
    bmi: details.bmi,
    smoker: details.smoker,
    diabetes: details.diabetes,
    hypertension: details.hypertension,
    heart_disease: details.heart_disease,
    asthma: details.asthma,
    physical_activity_label:
      details.physical_activity_level === "High"
        ? "Высокий"
        : details.physical_activity_level === "Low"
          ? "Низкий"
          : "Средний",
    daily_steps: details.daily_steps,
    sleep_hours: details.sleep_hours,
    stress_level: details.stress_level,
    doctor_visits_per_year: details.doctor_visits_per_year,
    hospital_admissions: details.hospital_admissions,
    medication_count: details.medication_count,
    city_type_label:
      details.city_type === "Semi-Urban"
        ? "Пригород"
        : details.city_type === "Rural"
          ? "Сельская местность"
          : "Город",
    previous_year_cost: details.previous_year_cost,
  };
}
