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
import { featureMap } from "../../../shared/config/feature-map";
import type { OverviewResponse } from "../../../shared/types/medcost";

type Props = {
  overview: OverviewResponse;
};

export function ExplainabilityMonitorWidget({ overview }: Props) {
  const data = overview.predictions.top_factors.map((item) => ({
    factor: featureMap[item.feature_name] ?? item.feature_name,
    quantity: item.count,
  }));

  return (
    <section className="tile rounded-3xl border border-line/70 bg-white/70 p-5">
      <div className="flex items-center gap-2">
        <h2 className="widget-title">Монитор объяснимости</h2>
        <button
          type="button"
          className="group relative inline-grid h-5 w-5 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
          aria-label="Пояснение к монитору объяснимости"
        >
          <CircleHelp className="size-4" />
          <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-[320px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs text-[#334766] shadow-md group-hover:block">
            Показывает, какие признаки чаще всего сильнее влияют на прогноз стоимости лечения. Основано на значениях SHAP: чем выше «Количество», тем чаще признак попадает в топ факторов по пациентам.
          </span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-line/70 bg-white p-3">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="factor" width={140} />
              <Tooltip />
              <Bar name="Количество" dataKey="quantity" fill="#f2a531" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
