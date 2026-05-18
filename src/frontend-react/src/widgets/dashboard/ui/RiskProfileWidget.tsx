import type { OverviewResponse } from "../../../shared/types/medcost";
import { CircleHelp } from "lucide-react";

type Props = {
  overview: OverviewResponse;
};

const RISK_KEYS = [
  { key: "smokers_count", label: "Курение" },
  { key: "diabetes_count", label: "Диабет" },
  { key: "hypertension_count", label: "Гипертония" },
  { key: "heart_disease_count", label: "Сердечные заболевания" },
  { key: "asthma_count", label: "Астма" },
] as const;

export function RiskProfileWidget({ overview }: Props) {
  const total = Math.max(overview.synthetic.count, 1);

  return (
    <section className="tile rounded-3xl border border-line/70 bg-white/70 p-5">
      <div className="flex items-center gap-2">
        <h2 className="widget-title">Профиль рисков</h2>
        <button
          type="button"
          className="group relative inline-grid h-5 w-5 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
          aria-label="Пояснение к профилю рисков"
        >
          <CircleHelp className="size-4" />
          <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-[320px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs text-[#334766] shadow-md group-hover:block">
            Доля пациентов с каждым фактором риска в исторических данных. Процент считается как: количество пациентов с фактором / общее число записей.
          </span>
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {RISK_KEYS.map((item) => {
          const value = overview.synthetic[item.key];
          const percent = (value / total) * 100;
          return (
            <article key={item.key} className="rounded-2xl border border-line/70 bg-white p-3">
              <p className="tiny">{item.label}</p>
              <p className="m-0 mt-2 text-ui-lg font-semibold text-txt">{value.toLocaleString()}</p>
              <p className="m-0 text-ui-sm text-muted">{percent.toFixed(1)}%</p>
              <div className="mt-2 h-2 rounded bg-[#ecf1fa]">
                <div
                  className="h-2 rounded bg-[#4c7cf0]"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
