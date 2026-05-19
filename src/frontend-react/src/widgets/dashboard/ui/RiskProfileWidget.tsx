import type { OverviewResponse } from "../../../shared/types/medcost";
import { MiniStatCard, WidgetCard } from "../../../shared/ui/kit";

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
    <WidgetCard
      title="Профиль рисков"
      tooltipLabel="Пояснение к профилю рисков"
      tooltip="Доля пациентов с каждым фактором риска в исторических данных. Процент считается как: количество пациентов с фактором / общее число записей."
    >
      <div className="mt-4 grid gap-3">
        {RISK_KEYS.map((item) => {
          const value = overview.synthetic[item.key];
          const percent = (value / total) * 100;
          return (
            <MiniStatCard
              key={item.key}
              label={item.label}
              value={value.toLocaleString()}
              description={`${percent.toFixed(1)}%`}
              className="bg-white"
            >
              <div className="mt-2 h-2 rounded bg-[#ecf1fa]">
                <div
                  className="h-2 rounded bg-[#4c7cf0]"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </MiniStatCard>
          );
        })}
      </div>
    </WidgetCard>
  );
}
