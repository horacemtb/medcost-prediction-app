import { useMemo } from "react";
import { featureMap } from "../../../shared/config/feature-map";
import { Modal } from "../../../shared/ui/modal";
import { KitButton, KitLoader } from "../../../shared/ui/kit";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import { usePredictionDetailsModal } from "../model/PredictionDetailsModalContext";

function formatMoney(value: number) {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

function formatGender(value: number) {
  return value === 1 ? "Мужской" : "Женский";
}

function formatActivity(value: string) {
  if (value === "High") return "Высокий";
  if (value === "Low") return "Низкий";
  return "Средний";
}

function formatCity(value: string) {
  if (value === "Semi-Urban") return "Пригород";
  if (value === "Rural") return "Сельская местность";
  return "Город";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

function deriveRiskLevel(predictedCost: number) {
  if (predictedCost < 20000) return "Низкий";
  if (predictedCost < 50000) return "Средний";
  return "Высокий";
}

export function PredictionDetailsModal() {
  const { open, details, loading, error, closePredictionDetails, retryPredictionDetails } = usePredictionDetailsModal();
  const visibleLoading = useMinimumLoading(loading && !details, { minMs: 1000 });

  const sortedFactors = useMemo(
    () => (details ? [...details.risk_factors].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)) : []),
    [details]
  );

  const predictedCost = details?.predicted_cost ?? 0;
  const delta = details ? details.predicted_cost - details.previous_year_cost : 0;
  const riskLevel = details ? deriveRiskLevel(details.predicted_cost) : null;

  return (
    <Modal open={open} title={details?.full_name ?? "Карточка прогноза"} onClose={closePredictionDetails} className="prediction-details-modal">
      {visibleLoading && !details ? (
        <div className="prediction-details-state">
          <KitLoader label="�������� ��������..." />
        </div>
      ) : error && !details ? (
        <div className="prediction-details-state prediction-details-state--error">
          <p>{error.includes("404") ? "Прогноз не найден." : error}</p>
          <div className="prediction-details-actions">
            <KitButton type="button" variant="primary" onClick={retryPredictionDetails}>
              Повторить
            </KitButton>
          </div>
        </div>
      ) : details ? (
        <div className="prediction-details-grid">
          <section className="prediction-details-summary">
            <div className="prediction-details-hero">
              <p className="prediction-details-hero-value">{formatMoney(predictedCost)} ₽</p>
              <p className="prediction-details-hero-meta">ID: {details.prediction_id}</p>
              <p className="prediction-details-hero-meta">Дата: {formatDate(details.created_at)}</p>
            </div>

            <div className="prediction-details-kpis">
              <article>
                <span>Предыдущий год</span>
                <strong>{formatMoney(details.previous_year_cost)} ₽</strong>
              </article>
              <article>
                <span>Разница</span>
                <strong className={delta >= 0 ? "kpi-up" : "kpi-down"}>
                  {delta >= 0 ? "+" : ""}
                  {formatMoney(delta)} ₽
                </strong>
              </article>
              <article>
                <span>Уровень риска</span>
                <strong>{riskLevel}</strong>
              </article>
              <article>
                <span>Пациент</span>
                <strong>{details.full_name}</strong>
              </article>
            </div>
          </section>

          <section className="prediction-details-section">
            <h3 className="prediction-details-section-title">Пациент</h3>
            <div className="prediction-details-fields">
              <article><span>Возраст</span><strong>{details.age}</strong></article>
              <article><span>Пол</span><strong>{formatGender(details.gender)}</strong></article>
              <article><span>ИМТ</span><strong>{details.bmi}</strong></article>
              <article><span>Активность</span><strong>{formatActivity(details.physical_activity_level)}</strong></article>
              <article><span>Шагов</span><strong>{details.daily_steps.toLocaleString("ru-RU")}</strong></article>
              <article><span>Сон</span><strong>{details.sleep_hours}</strong></article>
              <article><span>Стресс</span><strong>{details.stress_level}</strong></article>
              <article><span>Визиты</span><strong>{details.doctor_visits_per_year}</strong></article>
              <article><span>Госпитализации</span><strong>{details.hospital_admissions}</strong></article>
              <article><span>Лекарства</span><strong>{details.medication_count}</strong></article>
              <article><span>Тип города</span><strong>{formatCity(details.city_type)}</strong></article>
              <article><span>Хронические факторы</span><strong>{[details.smoker, details.diabetes, details.hypertension, details.heart_disease, details.asthma].filter(Boolean).length}</strong></article>
            </div>
          </section>

          <section className="prediction-details-section">
            <h3 className="prediction-details-section-title">Факторы расчета</h3>
            <div className="prediction-factor-list">
              {sortedFactors.map((factor) => (
                <article key={`${factor.feature_name}-${factor.shap_value}`} className="prediction-factor-card">
                  <div className="prediction-factor-head">
                    <div>
                      <span>{featureMap[factor.feature_name] ?? factor.feature_name}</span>
                      <small>{factor.feature_value === "" ? "—" : String(factor.feature_value)}</small>
                    </div>
                    <strong className={factor.direction === "increase" ? "kpi-up" : "kpi-down"}>
                      {factor.shap_value > 0 ? "+" : ""}
                      {factor.shap_value.toFixed(2)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}


