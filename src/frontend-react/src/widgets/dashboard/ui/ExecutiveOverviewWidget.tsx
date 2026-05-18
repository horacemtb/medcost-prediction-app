import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleHelp } from "lucide-react";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { MiniStatCard } from "../../../shared/ui/kit/MiniStatCard";

type Props = {
  overview: OverviewResponse;
};

function toHistogramData(bins: number[], counts: number[]) {
  return counts.map((count, index) => {
    const left = bins[index] ?? 0;
    const right = bins[index + 1] ?? left;
    return {
      name: `${Math.round(left).toLocaleString()}-${Math.round(right).toLocaleString()}`,
      count,
    };
  });
}

export function ExecutiveOverviewWidget({ overview }: Props) {
  const syntheticHistogram = toHistogramData(
    overview.synthetic.annual_cost_histogram.bins,
    overview.synthetic.annual_cost_histogram.counts,
  );
  const predictionHistogram = toHistogramData(
    overview.predictions.predicted_cost_histogram.bins,
    overview.predictions.predicted_cost_histogram.counts,
  );

  return (
    <section className="tile rounded-3xl border border-line/70 bg-white/70 p-5">
      <div className="flex items-center gap-2">
        <h2 className="widget-title">Сводный обзор</h2>
        <button
          type="button"
          className="group relative inline-grid h-5 w-5 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
          aria-label="Пояснение к сводному обзору"
        >
          <CircleHelp className="size-4" />
          <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-[320px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs text-[#334766] shadow-md group-hover:block">
            Сводные метрики по выборке и прогнозам: объемы данных, средние значения и распределение расходов по диапазонам.
          </span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <MiniStatCard label="Исторические данные" value={overview.synthetic.count.toLocaleString()} />
        <MiniStatCard label="Прогнозы" value={overview.predictions.count.toLocaleString()} />
        <MiniStatCard
          label="Средние расходы по выборке"
          value={Math.round(overview.synthetic.avg_annual_medical_cost).toLocaleString()}
        />
        <MiniStatCard
          label="Средние прогнозируемые расходы"
          value={Math.round(overview.predictions.avg_predicted_cost).toLocaleString()}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line/70 bg-white p-3">
          <div className="flex items-center gap-2">
            <p className="tiny">Распределение исторических расходов</p>
            <button
              type="button"
              className="group relative inline-grid h-4 w-4 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
              aria-label="Пояснение к гистограмме расходов"
            >
              <CircleHelp className="size-3.5" />
              <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-[280px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs normal-case tracking-normal text-[#334766] shadow-md group-hover:block">
                Показывает распределение годовых расходов по историческим данным. Каждый столбец - число записей в диапазоне расходов.
              </span>
            </button>
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={syntheticHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4c7cf0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-line/70 bg-white p-3">
          <div className="flex items-center gap-2">
            <p className="tiny">Распределение прогнозируемых расходов</p>
            <button
              type="button"
              className="group relative inline-grid h-4 w-4 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
              aria-label="Пояснение к гистограмме прогнозируемых расходов"
            >
              <CircleHelp className="size-3.5" />
              <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-[280px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs normal-case tracking-normal text-[#334766] shadow-md group-hover:block">
                Показывает распределение предсказанных годовых расходов. Используется для сравнения формы прогноза с историческими данными.
              </span>
            </button>
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b6ad" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
