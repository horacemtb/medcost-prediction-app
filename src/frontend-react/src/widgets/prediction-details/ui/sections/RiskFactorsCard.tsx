import { featureMap } from "../../../../shared/config/feature-map";
import { formatMoney } from "../../model/prediction-details-helpers";
import type { RiskFactor } from "../../../../shared/types/medcost";

type RiskFactorsCardProps = {
  factors: RiskFactor[];
};

export function RiskFactorsCard({ factors }: RiskFactorsCardProps) {
  const maxAbsValue = Math.max(
    ...factors.map((factor) => Math.abs(factor.shap_value)),
  );
  return (
    <article className="min-w-0 rounded-2xl border border-line/70 bg-white/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="m-0 text-ui-lg font-semibold text-[#1a2741]">
          Ключевые факторы влияния на прогноз
        </h3>
      </div>
      <p className="m-0 mb-3 text-ui-xs text-[#5f6e86]">
        Показано, как отдельные факторы изменили базовый прогноз.
      </p>

      <div className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(88px,0.7fr)] gap-2 border-b border-line/70 pb-2 text-ui-sm font-semibold text-[#5f6e86]">
        <span>Фактор</span>
        <span>Влияние</span>
        <span className="text-right">Вклад (в год)</span>
      </div>

      <div className="mt-2 grid gap-2">
        {factors.map((factor, index) => {
          const absValue = Math.abs(factor.shap_value);

          const percent =
            absValue === 0
              ? 0
              : Math.max(6, Math.min(100, (absValue / maxAbsValue) * 100));
          const name = featureMap[factor.feature_name] ?? factor.feature_name;
          const money = formatMoney(factor.shap_value);
          const isPositive = factor.shap_value > 0;
          const color = isPositive ? "bg-[#18794e]" : "bg-[#b42318]";
          const position = isPositive ? "left-1/2" : "right-1/2";
          const radius = isPositive ? "rounded-r-[4px]" : "rounded-l-[4px]";
          return (
            <div
              key={`${factor.feature_name}-${index}`}
              className="grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(88px,0.7fr)] items-center gap-3 text-ui-sm text-[#1f2c44]"
            >
              <div className="inline-flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">
                  {index + 1}. {name}
                </span>
              </div>

              <div className="relative h-10">
                <div className="absolute left-1/2 top-0 h-full w-px bg-[#98a7bf]" />

                <div
                  className={`absolute ${position} top-1/2 h-6 w-[calc(50%-2px)] -translate-y-1/2 ${radius} bg-[#dbe9dc]`}
                />

                <div
                  className={`absolute ${position} top-1/2 h-6 -translate-y-1/2 ${radius} ${color}`}
                  style={{ width: `${percent / 2}%` }}
                />
              </div>

              <div className="text-right text-ui-sm font-medium text-[#2d3b55]">
                {money}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-line/70 pt-2">
        <div className="mx-auto grid w-[56%] grid-cols-[1fr_auto_1fr] items-center gap-2 text-ui-xs text-[#6a7890]">
          <span className="text-left">Снижение прогноза</span>
          <span className="font-semibold text-[#2d3b55]">0</span>
          <span className="text-right">Увеличение прогноза</span>
        </div>
      </div>
    </article>
  );
}
