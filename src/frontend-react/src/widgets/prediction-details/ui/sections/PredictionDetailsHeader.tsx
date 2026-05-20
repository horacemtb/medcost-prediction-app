import { FileDown, RefreshCcw } from "lucide-react";
import { KitButton, PageHeader } from "../../../../shared/ui/kit";
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
    <PageHeader
      title="Отчет анализа"
      titleAs="h2"
      sticky
      actions={
        <>
          <KitButton type="button" onClick={() => onRecalculate?.(details)}>
            <RefreshCcw className="size-4" />
            Пересчитать
          </KitButton>
          <KitButton type="button" onClick={() => onExport?.(details)}>
            <FileDown className="size-4" />
            Экспорт в PDF
          </KitButton>
        </>
      }
    />
  );
}
