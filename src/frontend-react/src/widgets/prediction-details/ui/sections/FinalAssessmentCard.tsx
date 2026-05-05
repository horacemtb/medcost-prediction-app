import { ShieldCheck } from "lucide-react";

type FinalAssessmentCardProps = {
  percentile?: number | null;
  riskCategory?: string | null;
};

export function FinalAssessmentCard({
  percentile,
  riskCategory,
}: FinalAssessmentCardProps) {
  const hasData = typeof percentile === "number" && Boolean(riskCategory);
  const score = typeof percentile === "number" ? percentile / 100 : 0;
  const isHighRisk =
    riskCategory === "Высокий риск" ||
    riskCategory === "Экстремальный риск (топ-5%)";
  const isStandardRisk = riskCategory === "Стандартный";
  const activeBarColor = isHighRisk
    ? "bg-[#ff7a7a]"
    : isStandardRisk
      ? "bg-[#f7c86c]"
      : "bg-[#7fe39b]";
  const riskTextColor = isHighRisk
    ? "text-[#ffd0d0]"
    : isStandardRisk
      ? "text-[#ffe3a8]"
      : "text-[#9fe8b4]";
  return (
    <article className="rounded-2xl border border-[#11326f] bg-[#0d2f68] p-5 text-white">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <p className="m-0 text-ui-xs uppercase tracking-[0.14em] text-[#b9cae8]">
            Итоговая оценка
          </p>
          <p className="m-0 mt-1 text-ui-sm text-[#d4e1f7]">
            Перцентиль: {hasData ? `${percentile.toFixed(0)}%` : "Нет данных"}
          </p>
        </div>
        <p className="m-0 text-ui-kpi leading-none">{hasData ? score.toFixed(2) : "—"}</p>
      </div>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded-full ${
              i < Math.round(score * 6) ? activeBarColor : "bg-[#5d769f]"
            }`}
          />
        ))}
      </div>

      <p className={`m-0 mt-4 inline-flex items-center gap-2 text-ui-sm ${riskTextColor}`}>
        <ShieldCheck className="size-5" />
        Уровень риска: {riskCategory || "Нет данных"}
      </p>
    </article>
  );
}
