import { useMemo, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import { featureMap } from "../../../shared/config/feature-map";
import type { PredictionInput, PredictionResponse, RiskFactor } from "../../../shared/types/medcost";
import { ErrorAlert, FieldMeta, KitButton, KitCheckbox, KitInput, KitSelect } from "../../../shared/ui/kit";
import { PredictionResultWidget } from "../../../widgets/prediction-result/ui/PredictionResultWidget";

const initialForm = {
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

type FormState = typeof initialForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

function toPayload(f: FormState): PredictionInput {
  const gender = f.gender === "Мужской" ? 1 : 0;
  const physical_activity_level = f.physical_activity_label === "Высокий" ? "High" : f.physical_activity_label === "Низкий" ? "Low" : "Medium";
  const city_type = f.city_type_label === "Пригород" ? "Semi-Urban" : f.city_type_label === "Сельская местность" ? "Rural" : "Urban";

  return {
    full_name: f.full_name,
    age: f.age,
    gender,
    bmi: f.bmi,
    smoker: f.smoker,
    diabetes: f.diabetes,
    hypertension: f.hypertension,
    heart_disease: f.heart_disease,
    asthma: f.asthma,
    physical_activity_level,
    daily_steps: f.daily_steps,
    sleep_hours: f.sleep_hours,
    stress_level: f.stress_level,
    doctor_visits_per_year: f.doctor_visits_per_year,
    hospital_admissions: f.hospital_admissions,
    medication_count: f.medication_count,
    city_type,
    previous_year_cost: f.previous_year_cost,
  };
}

export function PredictPage() {
  const tabs = ["Пациент", "Образ жизни", "Факторы", "Расходы"] as const;
  type TabId = (typeof tabs)[number];

  const [form, setForm] = useState<FormState>(initialForm);
  const [activeTab, setActiveTab] = useState<TabId>("Пациент");
  const [costInput, setCostInput] = useState(initialForm.previous_year_cost.toLocaleString("ru-RU"));
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [factors, setFactors] = useState<RiskFactor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const delta = useMemo(() => (result ? result.predicted_cost - form.previous_year_cost : 0), [result, form.previous_year_cost]);
  const chronicCount = useMemo(
    () => [form.smoker, form.diabetes, form.hypertension, form.heart_disease, form.asthma].filter(Boolean).length,
    [form.smoker, form.diabetes, form.hypertension, form.heart_disease, form.asthma]
  );
  const topFactors = useMemo(() => [...factors].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)).slice(0, 5), [factors]);
  const riskLevel = useMemo(() => {
    if (!result) return null;
    if (result.predicted_cost < 20000) return "Низкий";
    if (result.predicted_cost < 50000) return "Средний";
    return "Высокий";
  }, [result]);
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
  }, [form, chronicCount]);

  function normalizeName(value: string) {
    return value.replace(/\s+/g, " ").trim();
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function parseMoney(value: string) {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }

  function validate(values: FormState): FormErrors {
    const next: FormErrors = {};
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

  async function submit() {
    const normalized = { ...form, full_name: normalizeName(form.full_name) };
    const validationErrors = validate(normalized);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setError("");
    setLoading(true);
    try {
      const r = await medcostApi.predict(toPayload(normalized));
      setResult(r);
      setFactors([]);
      setForm(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function loadFactors() {
    if (!result) return;
    setLoading(true);
    try {
      const f = await medcostApi.factors(result.prediction_id);
      setFactors(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-main">
      {error && <ErrorAlert message={error} />}
      <div className="predict-page-layout">
        <div className="predict-main-column">
          <section className="tile form-tile predict-form-widget">
            <div className="predict-topbar">
              <div className="form-tabs" role="tablist" aria-label="Шаги формы">
                {tabs.map((tab, index) => (
                  <KitButton
                    key={tab}
                    role="tab"
                    type="button"
                    variant="tab"
                    aria-selected={activeTab === tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {index + 1}. {tab}
                  </KitButton>
                ))}
              </div>
              <div className="form-actions top-actions">
                <KitButton type="button" onClick={() => { setForm(initialForm); setCostInput(initialForm.previous_year_cost.toLocaleString("ru-RU")); setErrors({}); setResult(null); setFactors([]); setError(""); }}>
                  Очистить
                </KitButton>
                <KitButton type="button" className="primary" variant="primary" disabled={loading} onClick={submit}>{loading ? "Расчет..." : "Рассчитать"}</KitButton>
              </div>
            </div>

            {activeTab === "Пациент" && (
            <div className="form-section">
              <h3>Пациент</h3>
              <div className="grid">
                <label>ФИО пациента
                  <KitInput
                    value={form.full_name}
                    placeholder="Иванов Иван Иванович"
                    aria-invalid={Boolean(errors.full_name)}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    onBlur={(e) => updateField("full_name", normalizeName(e.target.value))}
                  />
                  <FieldMeta error={errors.full_name} />
                </label>
                <label>Возраст
                  <KitInput type="number" min={18} max={100} value={form.age} aria-invalid={Boolean(errors.age)} onChange={(e) => updateField("age", Number(e.target.value))} />
                  <FieldMeta error={errors.age} />
                </label>
                <label>Пол
                  <KitSelect value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                    <option>Женский</option>
                    <option>Мужской</option>
                  </KitSelect>
                </label>
                <label>ИМТ
                  <KitInput type="number" min={10} max={60} step={0.1} value={form.bmi} aria-invalid={Boolean(errors.bmi)} onChange={(e) => updateField("bmi", Number(e.target.value))} />
                  <FieldMeta error={errors.bmi} hint="Норма: 18.5–24.9" />
                </label>
              </div>
            </div>
            )}

            {activeTab === "Образ жизни" && (
            <div className="form-section">
              <h3>Образ жизни</h3>
              <div className="grid">
                <label>Уровень физической активности
                  <KitSelect value={form.physical_activity_label} onChange={(e) => updateField("physical_activity_label", e.target.value)}>
                    <option>Низкий</option>
                    <option>Средний</option>
                    <option>Высокий</option>
                  </KitSelect>
                </label>
                <label>Тип населённого пункта
                  <KitSelect value={form.city_type_label} onChange={(e) => updateField("city_type_label", e.target.value)}>
                    <option>Город</option>
                    <option>Пригород</option>
                    <option>Сельская местность</option>
                  </KitSelect>
                </label>
                <label>Шагов в день
                  <KitInput type="number" min={0} max={50000} step={100} value={form.daily_steps} aria-invalid={Boolean(errors.daily_steps)} onChange={(e) => updateField("daily_steps", Number(e.target.value))} />
                  <FieldMeta error={errors.daily_steps} hint="Норма: 7000+" />
                </label>
                <label>Часы сна
                  <KitInput type="number" min={0} max={24} step={0.5} value={form.sleep_hours} aria-invalid={Boolean(errors.sleep_hours)} onChange={(e) => updateField("sleep_hours", Number(e.target.value))} />
                  <FieldMeta error={errors.sleep_hours} hint="Рекомендация: 7–9" />
                </label>
                <label>Уровень стресса
                  <div className="stress-field">
                    <input type="range" min={1} max={10} step={1} value={form.stress_level} aria-invalid={Boolean(errors.stress_level)} onChange={(e) => updateField("stress_level", Number(e.target.value))} />
                    <span className="stress-value">{form.stress_level}</span>
                  </div>
                  <FieldMeta error={errors.stress_level} />
                </label>
              </div>
            </div>
            )}

            {activeTab === "Факторы" && (
            <div className="form-section">
              <h3>Хронические факторы</h3>
              <div className="checks">
                {(["smoker", "diabetes", "hypertension", "heart_disease", "asthma"] as const).map((k) => (
                  <KitCheckbox key={k} label={featureMap[k]} checked={form[k]} onChange={(e) => updateField(k, e.target.checked)} />
                ))}
              </div>
              <small className="field-hint">
                {chronicCount ? `Отмечено факторов: ${chronicCount}` : "Факторы не выбраны"}
              </small>
            </div>
            )}

            {activeTab === "Расходы" && (
            <div className="form-section">
              <h3>Расходы и обращения</h3>
              <div className="grid">
                <label>Визитов к врачу в год
                  <KitInput type="number" min={0} max={100} step={1} value={form.doctor_visits_per_year} onChange={(e) => updateField("doctor_visits_per_year", Number(e.target.value))} />
                </label>
                <label>Госпитализаций
                  <KitInput type="number" min={0} max={50} step={1} value={form.hospital_admissions} onChange={(e) => updateField("hospital_admissions", Number(e.target.value))} />
                </label>
                <label>Количество лекарств
                  <KitInput type="number" min={0} max={100} step={1} value={form.medication_count} onChange={(e) => updateField("medication_count", Number(e.target.value))} />
                </label>
                <label>Расходы за прошлый год
                  <KitInput
                    inputMode="numeric"
                    value={costInput}
                    aria-invalid={Boolean(errors.previous_year_cost)}
                    onChange={(e) => {
                      const numeric = parseMoney(e.target.value);
                      setCostInput(numeric ? numeric.toLocaleString("ru-RU") : "");
                      updateField("previous_year_cost", numeric);
                    }}
                    onBlur={() => {
                      setCostInput(form.previous_year_cost.toLocaleString("ru-RU"));
                    }}
                  />
                  <FieldMeta error={errors.previous_year_cost} hint="₽" />
                </label>
              </div>
            </div>
            )}

          </section>

          {result && (
            <PredictionResultWidget
              predictionId={result.prediction_id}
              fullName={result.full_name}
              predictedCost={result.predicted_cost}
              delta={delta}
              riskLevel={riskLevel}
              topFactors={topFactors}
              loading={loading}
              onLoadFactors={loadFactors}
            />
          )}
        </div>

        <aside className="predict-side-widget">
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
        </aside>
      </div>
    </section>
  );
}



