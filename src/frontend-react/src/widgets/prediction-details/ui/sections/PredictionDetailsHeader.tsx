import { FileDown, RefreshCcw } from "lucide-react";
import { KitButton } from "../../../../shared/ui/kit";
import type { PredictionDetailsResponse } from "../../../../shared/types/medcost";

type PredictionDetailsHeaderProps = {
  details: PredictionDetailsResponse;
  onRecalculate?: (details: PredictionDetailsResponse) => void;
  onExport?: (details: PredictionDetailsResponse) => void;
};

export function PredictionDetailsHeader({
  details,
  onRecalculate,
  onExport,
}: PredictionDetailsHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-start justify-between gap-3 bg-[#f6f8fd] px-2 pb-1 pt-1">
      <h2 className="m-0 text-ui-display text-[#0d1b39]">Отчет анализа</h2>
      <div className="flex flex-wrap gap-2">
        <KitButton type="button" onClick={() => onRecalculate?.(details)}>
          <RefreshCcw className="size-4" />
          Пересчитать
        </KitButton>
        <KitButton type="button" onClick={() => onExport?.(details)}>
          <FileDown className="size-4" />
          Экспорт в PDF
        </KitButton>
      </div>
    </div>
  );
}
