import type { OverviewResponse } from "../../../shared/types/medcost";
import { MiniStatCard, WidgetCard } from "../../../shared/ui/kit";

type Props = {
  overview: OverviewResponse;
};

function formatSignedMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value).toLocaleString()} ₽`;
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatSignedPp(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} п.п.`;
}

export function PopulationPredictionDriftWidget({ overview }: Props) {
  const syntheticMean = overview.synthetic.avg_annual_medical_cost;
  const predictionMean = overview.predictions.avg_predicted_cost;
  const meanDiff = predictionMean - syntheticMean;
  const meanDiffPct = syntheticMean === 0 ? 0 : (meanDiff / syntheticMean) * 100;

  const syntheticMedian = overview.synthetic.median_annual_medical_cost;
  const predictionMedian = overview.predictions.median_predicted_cost;
  const medianDiff = predictionMedian - syntheticMedian;
  const medianDiffPct = syntheticMedian === 0 ? 0 : (medianDiff / syntheticMedian) * 100;

  const highCostPredictionShare = overview.predictions.high_cost_prediction_share;
  const highCostShareDiff = highCostPredictionShare - 10;

  return (
    <WidgetCard
      title="Отклонение прогноза от исторической выборки"
      tooltipLabel="Пояснение к смещению прогноза"
      tooltip="Сравнение распределения прогнозов с исторической выборкой: различия по среднему, медиане и доле прогнозов выше 90-го перцентиля исторических расходов."
    >
      <div className="mt-4 grid gap-3">
        <MiniStatCard
          label="Средний расход на человека"
          value={`${formatSignedMoney(meanDiff)} / ${formatSignedPercent(meanDiffPct)}`}
        />
        <MiniStatCard
          label="Медианный расход"
          value={`${formatSignedMoney(medianDiff)} / ${formatSignedPercent(medianDiffPct)}`}
        />
        <MiniStatCard
          label="Доля дорогих случаев"
          value={`${highCostPredictionShare.toFixed(1)}% (${formatSignedPp(highCostShareDiff)})`}
        />
      </div>
    </WidgetCard>
  );
}
