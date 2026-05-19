import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { OverviewResponse } from "../../../shared/types/medcost";
import { ChartLegendItem, WidgetCard } from "../../../shared/ui/kit";

type Props = {
  overview: OverviewResponse;
};

const COLORS = ["#4c7cf0", "#10b6ad", "#f2a531", "#8b9bb8"];

function toRussianGenderLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "male" || normalized === "мужской") return "Мужской";
  if (normalized === "female" || normalized === "женский") return "Женский";
  return value;
}

export function GenderSegmentationWidget({ overview }: Props) {
  const entries = Object.entries(overview.synthetic.gender_distribution);
  const data = entries.map(([gender, count]) => ({
    name: toRussianGenderLabel(gender),
    value: count,
  }));

  return (
    <WidgetCard title="Распределение по полу">
      <div className="mt-4 grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="h-64 rounded-2xl border border-line/70 bg-white p-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-start gap-2">
          {data.map((entry, index) => (
            <ChartLegendItem
              key={entry.name}
              label={entry.name}
              value={`${entry.value.toLocaleString()} записей`}
              color={COLORS[index % COLORS.length]}
            />
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
