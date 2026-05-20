import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { InfoTooltip, MiniStatCard, WidgetCard } from "../../../shared/ui/kit";

type Props = {
  overview: OverviewResponse;
};

function toHistogramData(bins: number[], counts: number[]) {
  const formatNumber = (value: number) => Math.round(value).toLocaleString("ru-RU");

  return counts.map((count, index) => {
    const left = bins[index] ?? 0;
    const right = bins[index + 1] ?? left;
    return {
      name: `${formatNumber(left)} - ${formatNumber(right)}`,
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
    <WidgetCard
      title="Сводный обзор"
      tooltipLabel="Пояснение к сводному обзору"
      tooltip="Сводные метрики по выборке и прогнозам: объемы данных, средние значения и распределение расходов по диапазонам."
    >

      <div className="mt-4 grid gap-3 min-[760px]:grid-cols-2 min-[1200px]:grid-cols-4">
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

      <div className="mt-5 grid gap-4 min-[1200px]:grid-cols-2">
        <article className="rounded-2xl border border-line/70 bg-white p-3">
          <div className="flex items-center gap-2">
            <p className="tiny">Распределение исторических расходов</p>
            <InfoTooltip label="Пояснение к гистограмме расходов" size="sm">
              Показывает распределение годовых расходов по историческим данным. Каждый столбец - число записей в диапазоне расходов.
            </InfoTooltip>
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={syntheticHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar name="Количество" dataKey="count" fill="#4c7cf0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-line/70 bg-white p-3">
          <div className="flex items-center gap-2">
            <p className="tiny">Распределение прогнозируемых расходов</p>
            <InfoTooltip label="Пояснение к гистограмме прогнозируемых расходов" size="sm">
              Показывает распределение предсказанных годовых расходов. Используется для сравнения формы прогноза с историческими данными.
            </InfoTooltip>
          </div>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar name="Количество" dataKey="count" fill="#10b6ad" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </WidgetCard>
  );
}
