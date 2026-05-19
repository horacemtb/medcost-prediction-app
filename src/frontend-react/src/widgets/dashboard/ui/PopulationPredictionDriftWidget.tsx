import type { OverviewResponse } from "../../../shared/types/medcost";
import { MiniStatCard, WidgetCard } from "../../../shared/ui/kit";

type Props = {
  overview: OverviewResponse;
};

function getHighBinShare(counts: number[]) {
  if (!counts.length) return 0;
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (!total) return 0;
  return (counts[counts.length - 1] / total) * 100;
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

  const highBinPred = getHighBinShare(overview.predictions.predicted_cost_histogram.counts);
  const highBinSynth = getHighBinShare(overview.synthetic.annual_cost_histogram.counts);
  const highBinDiff = highBinPred - highBinSynth;

  return (
    <WidgetCard
      title="Смещение прогноза относительно выборки"
      tooltipLabel="Пояснение к смещению прогноза"
      tooltip="Сравнение распределения прогнозов с базовой выборкой: различия по среднему, медиане и доле самых дорогих случаев (верхний бин гистограммы)."
    >
      <div className="mt-4 grid gap-3">
        <MiniStatCard
          label="Смещение среднего"
          value={`${Math.round(meanDiff).toLocaleString()} (${meanDiffPct.toFixed(1)}%)`}
        />
        <MiniStatCard
          label="Смещение медианы"
          value={`${Math.round(medianDiff).toLocaleString()} (${medianDiffPct.toFixed(1)}%)`}
        />
        <MiniStatCard
          label="Сдвиг верхнего бина"
          value={`${highBinDiff.toFixed(1)} п.п.`}
        />
      </div>
    </WidgetCard>
  );
}
