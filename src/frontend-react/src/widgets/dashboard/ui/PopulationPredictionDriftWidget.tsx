import type { OverviewResponse } from "../../../shared/types/medcost";
import { CircleHelp } from "lucide-react";

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
    <section className="tile rounded-3xl border border-line/70 bg-white/70 p-5">
      <div className="flex items-center gap-2">
        <h2 className="widget-title">Смещение прогноза относительно выборки</h2>
        <button
          type="button"
          className="group relative inline-grid h-5 w-5 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
          aria-label="Пояснение к смещению прогноза"
        >
          <CircleHelp className="size-4" />
          <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-[320px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs text-[#334766] shadow-md group-hover:block">
            Сравнение распределения прогнозов с базовой выборкой: различия по среднему, медиане и доле самых дорогих случаев (верхний бин гистограммы).
          </span>
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        <article className="tile rounded-2xl border border-line/70 bg-white/5 p-4 h-min">
          <p className="tiny">Смещение среднего</p>
          <p className="mt-2 text-ui-lg font-semibold text-txt">
            {Math.round(meanDiff).toLocaleString()} ({meanDiffPct.toFixed(1)}%)
          </p>
        </article>
        <article className="tile rounded-2xl border border-line/70 bg-white/5 p-4 h-min">
          <p className="tiny">Смещение медианы</p>
          <p className="mt-2 text-ui-lg font-semibold text-txt">
            {Math.round(medianDiff).toLocaleString()} ({medianDiffPct.toFixed(1)}%)
          </p>
        </article>
        <article className="tile rounded-2xl border border-line/70 bg-white/5 p-4 h-min">
          <p className="tiny">Сдвиг верхнего бина</p>
          <p className="mt-2 text-ui-lg font-semibold text-txt">{highBinDiff.toFixed(1)} п.п.</p>
        </article>
      </div>
    </section>
  );
}
