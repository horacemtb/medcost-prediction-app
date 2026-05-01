import { featureMap } from "../../../shared/config/feature-map";
import { FieldMeta, KitButton, KitCheckbox, KitInput, KitSelect } from "../../../shared/ui/kit";
import type { PredictFormErrors, PredictFormState, PredictTabId } from "../../../pages/predict/model/predict-form";

type PredictFormWidgetProps = {
  tabs: readonly PredictTabId[];
  activeTab: PredictTabId;
  form: PredictFormState;
  errors: PredictFormErrors;
  costInput: string;
  loading: boolean;
  chronicCount: number;
  onTabChange: (tab: PredictTabId) => void;
  onUpdateField: <K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) => void;
  onFullNameBlur: (value: string) => void;
  onCostInputChange: (value: string) => void;
  onCostInputBlur: () => void;
  onReset: () => void;
  onSubmit: () => void;
};

export function PredictFormWidget({
  tabs,
  activeTab,
  form,
  errors,
  costInput,
  loading,
  chronicCount,
  onTabChange,
  onUpdateField,
  onFullNameBlur,
  onCostInputChange,
  onCostInputBlur,
  onReset,
  onSubmit,
}: PredictFormWidgetProps) {
  return (
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
              onClick={() => onTabChange(tab)}
            >
              {index + 1}. {tab}
            </KitButton>
          ))}
        </div>
        <div className="form-actions top-actions">
          <KitButton type="button" onClick={onReset}>
            Очистить
          </KitButton>
          <KitButton type="button" className="primary" variant="primary" disabled={loading} onClick={onSubmit}>
            {loading ? "Расчет..." : "Рассчитать"}
          </KitButton>
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
                onChange={(e) => onUpdateField("full_name", e.target.value)}
                onBlur={(e) => onFullNameBlur(e.target.value)}
              />
              <FieldMeta error={errors.full_name} />
            </label>
            <label>Возраст
              <KitInput type="number" min={18} max={100} value={form.age} aria-invalid={Boolean(errors.age)} onChange={(e) => onUpdateField("age", Number(e.target.value))} />
              <FieldMeta error={errors.age} />
            </label>
            <label>Пол
              <KitSelect value={form.gender} onChange={(e) => onUpdateField("gender", e.target.value)}>
                <option>Женский</option>
                <option>Мужской</option>
              </KitSelect>
            </label>
            <label>ИМТ
              <KitInput type="number" min={10} max={60} step={0.1} value={form.bmi} aria-invalid={Boolean(errors.bmi)} onChange={(e) => onUpdateField("bmi", Number(e.target.value))} />
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
              <KitSelect value={form.physical_activity_label} onChange={(e) => onUpdateField("physical_activity_label", e.target.value)}>
                <option>Низкий</option>
                <option>Средний</option>
                <option>Высокий</option>
              </KitSelect>
            </label>
            <label>Тип населённого пункта
              <KitSelect value={form.city_type_label} onChange={(e) => onUpdateField("city_type_label", e.target.value)}>
                <option>Город</option>
                <option>Пригород</option>
                <option>Сельская местность</option>
              </KitSelect>
            </label>
            <label>Шагов в день
              <KitInput type="number" min={0} max={50000} step={100} value={form.daily_steps} aria-invalid={Boolean(errors.daily_steps)} onChange={(e) => onUpdateField("daily_steps", Number(e.target.value))} />
              <FieldMeta error={errors.daily_steps} hint="Норма: 7000+" />
            </label>
            <label>Часы сна
              <KitInput type="number" min={0} max={24} step={0.5} value={form.sleep_hours} aria-invalid={Boolean(errors.sleep_hours)} onChange={(e) => onUpdateField("sleep_hours", Number(e.target.value))} />
              <FieldMeta error={errors.sleep_hours} hint="Рекомендация: 7–9" />
            </label>
            <label>Уровень стресса
              <div className="stress-field">
                <input type="range" min={1} max={10} step={1} value={form.stress_level} aria-invalid={Boolean(errors.stress_level)} onChange={(e) => onUpdateField("stress_level", Number(e.target.value))} />
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
              <KitCheckbox key={k} label={featureMap[k]} checked={form[k]} onChange={(e) => onUpdateField(k, e.target.checked)} />
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
              <KitInput type="number" min={0} max={100} step={1} value={form.doctor_visits_per_year} onChange={(e) => onUpdateField("doctor_visits_per_year", Number(e.target.value))} />
            </label>
            <label>Госпитализаций
              <KitInput type="number" min={0} max={50} step={1} value={form.hospital_admissions} onChange={(e) => onUpdateField("hospital_admissions", Number(e.target.value))} />
            </label>
            <label>Количество лекарств
              <KitInput type="number" min={0} max={100} step={1} value={form.medication_count} onChange={(e) => onUpdateField("medication_count", Number(e.target.value))} />
            </label>
            <label>Расходы за прошлый год
              <KitInput
                inputMode="numeric"
                value={costInput}
                aria-invalid={Boolean(errors.previous_year_cost)}
                onChange={(e) => onCostInputChange(e.target.value)}
                onBlur={onCostInputBlur}
              />
              <FieldMeta error={errors.previous_year_cost} hint="₽" />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
