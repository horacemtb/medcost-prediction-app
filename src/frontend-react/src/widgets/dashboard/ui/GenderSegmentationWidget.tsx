import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { OverviewResponse } from "../../../shared/types/medcost";

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
    <section className="tile rounded-3xl border border-line/70 bg-white/70 p-5">
      <h2 className="widget-title">Распределение по полу</h2>
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
        <div className="grid gap-2 content-start">
          {data.map((entry, index) => (
            <article key={entry.name} className="rounded-xl border border-line/70 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-ui-sm font-semibold text-txt">{entry.name}</p>
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
              <p className="m-0 text-ui-sm text-muted">{entry.value.toLocaleString()} записей</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
