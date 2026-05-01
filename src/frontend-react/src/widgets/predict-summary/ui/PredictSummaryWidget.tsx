import { useMemo } from "react";
import { featureMap } from "../../../shared/config/feature-map";

type PredictSummaryForm = {
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

type PredictSummaryWidgetProps = {
  form: PredictSummaryForm;
  chronicCount: number;
};

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function PredictSummaryWidget({ form, chronicCount }: PredictSummaryWidgetProps) {
  const summaryIssues = useMemo(() => {
    const issues: string[] = [];
    const normalizedName = normalizeName(form.full_name);
    if (!normalizedName || normalizedName.length < 5) issues.push("Проверьте ФИО пациента.");
    if (form.age < 18 || form.age > 100) issues.push("Возраст вне допустимого диапазона.");
    if (form.bmi < 10 || form.bmi > 60) issues.push("ИМТ вне диапазона 10–60.");
    if (form.daily_steps < 0 || form.daily_steps > 50000) issues.push("Шаги в день вне диапазона.");
    if (form.sleep_hours < 0 || form.sleep_hours > 24) issues.push("Часы сна вне диапазона 0–24.");
    if (form.previous_year_cost < 0) issues.push("Расходы не могут быть отрицательными.");
    return issues;
  }, [form]);

  const completion = useMemo(() => {
    const checks = [
      Boolean(normalizeName(form.full_name)),
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
    return { done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
  }, [form]);

  const bmiCategory = useMemo(() => {
    if (form.bmi < 18.5) return "Ниже нормы";
    if (form.bmi < 25) return "Норма";
    if (form.bmi < 30) return "Избыточный";
    return "Ожирение";
  }, [form.bmi]);

  const stressCategory = useMemo(() => {
    if (form.stress_level <= 3) return "Низкий";
    if (form.stress_level <= 7) return "Средний";
    return "Высокий";
  }, [form.stress_level]);

  const predictedProfile = useMemo(() => {
    let score = 0;
    if (form.bmi >= 30) score += 2;
    if (form.stress_level >= 8) score += 2;
    if (form.daily_steps < 5000) score += 1;
    if (form.sleep_hours < 6) score += 1;
    score += chronicCount;
    if (form.previous_year_cost > 60000) score += 2;
    if (form.previous_year_cost > 30000) score += 1;
    if (score <= 3) return "Низкая нагрузка";
    if (score <= 7) return "Средняя нагрузка";
    return "Высокая нагрузка";
  }, [chronicCount, form]);

  return (
    <section className="tile summary-card summary-sticky">
      <p className="tiny">Сводка перед расчетом</p>
      <p>{normalizeName(form.full_name) || "ФИО не заполнено"}</p>
      <div className="summary-progress">
        <div className="summary-progress-head">
          <span>Заполнено: {completion.done}/{completion.total}</span>
          <strong>{completion.percent}%</strong>
        </div>
        <div className="summary-progress-bar">
          <span style={{ width: `${completion.percent}%` }} />
        </div>
      </div>
      <div className="summary-kpis">
        <article><span>Возраст</span><strong>{form.age}</strong></article>
        <article><span>ИМТ</span><strong>{form.bmi}</strong></article>
        <article><span>Расходы</span><strong>{form.previous_year_cost.toLocaleString("ru-RU")} ₽</strong></article>
        <article><span>Факторы</span><strong>{chronicCount}</strong></article>
      </div>
      <div className="summary-list">
        <p>Категория ИМТ: <strong>{bmiCategory}</strong></p>
        <p>Стресс: <strong>{stressCategory}</strong></p>
        <p>Активность: <strong>{form.physical_activity_label}</strong></p>
        <p>Профиль: <strong>{predictedProfile}</strong></p>
      </div>
      {chronicCount > 0 && (
        <div className="summary-risk-tags">
          {(["smoker", "diabetes", "hypertension", "heart_disease", "asthma"] as const)
            .filter((k) => form[k])
            .map((k) => <span key={k}>{featureMap[k]}</span>)}
        </div>
      )}
      {summaryIssues.length > 0 && (
        <div className="summary-issues">
          {summaryIssues.map((issue) => <p key={issue}>{issue}</p>)}
        </div>
      )}
    </section>
  );
}
