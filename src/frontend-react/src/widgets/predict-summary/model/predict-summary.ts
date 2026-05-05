export type PredictSummaryForm = {
  full_name: string;
  age: number;
  bmi: number;
  smoker: boolean;
  diabetes: boolean;
  hypertension: boolean;
  heart_disease: boolean;
  asthma: boolean;
  physical_activity_label: string;
  daily_steps: number;
  sleep_hours: number;
  stress_level: number;
  city_type_label: string;
  previous_year_cost: number;
};

export type PredictSummaryView = {
  normalizedName: string;
  summaryIssues: string[];
  completion: {
    done: number;
    total: number;
    percent: number;
  };
  bmiCategory: string;
  stressCategory: string;
  predictedProfile: string;
  chronicFactors: Array<
    "smoker" | "diabetes" | "hypertension" | "heart_disease" | "asthma"
  >;
};

export function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function buildPredictSummaryView(
  form: PredictSummaryForm,
  chronicCount: number,
): PredictSummaryView {
  const normalizedName = normalizeName(form.full_name);
  const summaryIssues: string[] = [];

  if (!normalizedName || normalizedName.length < 5) {
    summaryIssues.push("Проверьте ФИО пациента.");
  }
  if (form.age < 18 || form.age > 100) {
    summaryIssues.push("Возраст вне допустимого диапазона.");
  }
  if (form.bmi < 10 || form.bmi > 60) {
    summaryIssues.push("ИМТ вне диапазона 10–60.");
  }
  if (form.daily_steps < 0 || form.daily_steps > 50000) {
    summaryIssues.push("Шаги в день вне диапазона.");
  }
  if (form.sleep_hours < 0 || form.sleep_hours > 24) {
    summaryIssues.push("Часы сна вне диапазона 0–24.");
  }
  if (form.previous_year_cost < 0) {
    summaryIssues.push("Расходы не могут быть отрицательными.");
  }

  const checks = [
    Boolean(normalizedName),
    form.age >= 18 && form.age <= 100,
    form.bmi >= 10 && form.bmi <= 60,
    form.daily_steps >= 0 && form.daily_steps <= 50000,
    form.sleep_hours >= 0 && form.sleep_hours <= 24,
    form.stress_level >= 1 && form.stress_level <= 10,
    form.previous_year_cost >= 0,
    Boolean(form.physical_activity_label),
    Boolean(form.city_type_label),
  ];
  const done = checks.filter(Boolean).length;
  const total = checks.length;
  const percent = Math.round((done / total) * 100);

  let bmiCategory = "Ожирение";
  if (form.bmi < 18.5) bmiCategory = "Ниже нормы";
  else if (form.bmi < 25) bmiCategory = "Норма";
  else if (form.bmi < 30) bmiCategory = "Избыточный";

  let stressCategory = "Высокий";
  if (form.stress_level <= 3) stressCategory = "Низкий";
  else if (form.stress_level <= 7) stressCategory = "Средний";

  let score = 0;
  if (form.bmi >= 30) score += 2;
  if (form.stress_level >= 8) score += 2;
  if (form.daily_steps < 5000) score += 1;
  if (form.sleep_hours < 6) score += 1;
  score += chronicCount;
  if (form.previous_year_cost > 60000) score += 2;
  if (form.previous_year_cost > 30000) score += 1;

  let predictedProfile = "Высокая нагрузка";
  if (score <= 3) predictedProfile = "Низкая нагрузка";
  else if (score <= 7) predictedProfile = "Средняя нагрузка";

  const chronicFactors = (
    ["smoker", "diabetes", "hypertension", "heart_disease", "asthma"] as const
  ).filter((key) => form[key]);

  return {
    normalizedName,
    summaryIssues,
    completion: { done, total, percent },
    bmiCategory,
    stressCategory,
    predictedProfile,
    chronicFactors,
  };
}

