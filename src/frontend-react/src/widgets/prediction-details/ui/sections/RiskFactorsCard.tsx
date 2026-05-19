import { featureMap } from "../../../../shared/config/feature-map";
import type { RiskFactor } from "../../../../shared/types/medcost";
import {
  InfoTooltip,
  KitTable,
  KitTableBody,
  KitTableCell,
  KitTableHead,
  KitTableHeaderCell,
  KitTableRow,
  KitTableScroll,
  SectionCard,
} from "../../../../shared/ui/kit";
import { formatMoney } from "../../model/prediction-details-helpers";

type RiskFactorsCardProps = {
  factors: RiskFactor[];
};

export function RiskFactorsCard({ factors }: RiskFactorsCardProps) {
  const maxAbsValue = Math.max(
    ...factors.map((factor) => Math.abs(factor.shap_value)),
  );

  return (
    <SectionCard
      title="Ключевые факторы влияния на прогноз"
      description="Показано, как отдельные факторы изменили базовый прогноз."
      className="min-w-0"
    >
      <KitTableScroll>
        <KitTable className="w-full min-w-[520px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[40%]" />
            <col className="w-[26%]" />
          </colgroup>
          <KitTableHead>
            <KitTableRow className="border-b border-line/70 text-ui-sm font-semibold text-[#5f6e86]">
              <KitTableHeaderCell className="pb-2 text-left font-semibold">
                Фактор
              </KitTableHeaderCell>
              <KitTableHeaderCell className="pb-2 text-left font-semibold">
                Влияние
                <InfoTooltip size="sm" label="Пояснение к Влияние">
                  Значение менее 0 указывает на снижение прогноза, а значение
                  более 0 - на увеличение.
                </InfoTooltip>
              </KitTableHeaderCell>
              <KitTableHeaderCell className="pb-2 text-right font-semibold">
                Вклад (в год)
              </KitTableHeaderCell>
            </KitTableRow>
          </KitTableHead>
          <KitTableBody>
            {factors.map((factor, index) => {
              const absValue = Math.abs(factor.shap_value);

              const percent =
                absValue === 0
                  ? 0
                  : Math.max(6, Math.min(100, (absValue / maxAbsValue) * 100));
              const name =
                featureMap[factor.feature_name] ?? factor.feature_name;
              const money = formatMoney(factor.shap_value);
              const isPositive = factor.shap_value > 0;
              const color = isPositive ? "bg-[#18794e]" : "bg-[#b42318]";
              const position = isPositive ? "left-1/2" : "right-1/2";
              const radius = isPositive ? "rounded-r-[4px]" : "rounded-l-[4px]";

              return (
                <KitTableRow
                  key={`${factor.feature_name}-${index}`}
                  className="text-ui-sm text-[#1f2c44]"
                >
                  <KitTableCell className="min-w-0 py-1.5 pr-3 align-middle">
                    <span className="block truncate font-medium">
                      {index + 1}. {name}
                    </span>
                  </KitTableCell>
                  <KitTableCell className="py-1.5 pr-3 align-middle">
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
                  </KitTableCell>
                  <KitTableCell className="py-1.5 text-right align-middle text-ui-sm font-medium text-[#2d3b55]">
                    {money}
                  </KitTableCell>
                </KitTableRow>
              );
            })}
          </KitTableBody>
        </KitTable>
      </KitTableScroll>
    </SectionCard>
  );
}
