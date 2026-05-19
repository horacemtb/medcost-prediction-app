import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { featureMap } from "../../../shared/config/feature-map";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { WidgetCard } from "../../../shared/ui/kit";

type Props = {
  overview: OverviewResponse;
};

export function ExplainabilityMonitorWidget({ overview }: Props) {
  const data = overview.predictions.top_factors.map((item) => ({
    factor: featureMap[item.feature_name] ?? item.feature_name,
    quantity: item.count,
  }));

  return (
    <WidgetCard
      title="Монитор объяснимости"
      tooltipLabel="Пояснение к монитору объяснимости"
      tooltip="Показывает, какие признаки чаще всего сильнее влияют на прогноз стоимости лечения. Основано на значениях SHAP: чем выше «Количество», тем чаще признак попадает в топ факторов по пациентам."
    >

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
    </WidgetCard>
  );
}
