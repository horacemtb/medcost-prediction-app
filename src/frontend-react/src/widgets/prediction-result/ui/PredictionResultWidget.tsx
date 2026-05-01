import { featureMap } from "../../../shared/config/feature-map";
import { KitButton, KitLoader } from "../../../shared/ui/kit";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import type { RiskFactor } from "../../../shared/types/medcost";

type PredictionResultWidgetProps = {
  predictionId?: number;
  fullName?: string;
  predictedCost?: number;
  delta?: number;
  riskLevel?: string | null;
  topFactors: RiskFactor[];
  loading: boolean;
  onLoadFactors: () => void;
};

export function PredictionResultWidget({
  predictionId,
  fullName,
  predictedCost,
  delta,
  riskLevel,
  topFactors,
  loading,
  onLoadFactors,
}: PredictionResultWidgetProps) {
  const visibleLoading = useMinimumLoading(loading && predictionId === undefined, { minMs: 1000 });
  const deltaValue = delta ?? 0;

  function formatFeatureValue(value: string | number) {
    if (typeof value === "number") return value.toLocaleString("ru-RU");
    return value || "—";
  }

  return (
    <section className="tile form-tile prediction-result-widget">
      <h3 className="widget-title">Прогноз</h3>
      {visibleLoading ? (
        <div className="prediction-result-loading">
          <KitLoader label="Рассчитываем прогноз..." />
        </div>
      ) : (
      <div className="prediction-result-body">
        <p className="prediction-result-value">{(predictedCost ?? 0).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽</p>
        <p className="prediction-result-meta">Пациент: {fullName}</p>
        <p className="prediction-result-meta">Идентификатор: {predictionId}</p>
        <p className="prediction-result-meta">
          К прошлому году: {deltaValue >= 0 ? "+" : ""}
          {deltaValue.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
        </p>
        <p className="prediction-result-meta">
          Уровень риска: <strong>{riskLevel}</strong>
        </p>
        <KitButton type="button" onClick={onLoadFactors} disabled={loading}>
          Показать факторы
        </KitButton>
        {!!topFactors.length && (
          <div className="factor-list">
            {topFactors.map((factor, index) => {
              return (
                <div key={index} className="factor-item">
                  <div className="factor-head">
                    <div className="factor-title">
                      <span>{featureMap[factor.feature_name] ?? factor.feature_name}</span>
                      <small>{formatFeatureValue(factor.feature_value)}</small>
                    </div>
                    <strong className={`factor-score factor-score--${factor.direction}`}>
                      {factor.shap_value > 0 ? "+" : ""}
                      {factor.shap_value.toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </section>
  );
}

