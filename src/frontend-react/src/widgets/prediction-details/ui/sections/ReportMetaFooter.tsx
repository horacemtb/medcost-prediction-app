import { TrendingDown } from "lucide-react";
import { Panel } from "../../../../shared/ui/kit";
import { formatDate } from "../../model/prediction-details-helpers";

type ReportMetaFooterProps = {
  predictionId: number;
  createdAt: string;
};

export function ReportMetaFooter({
  predictionId,
  createdAt,
}: ReportMetaFooterProps) {
  return (
    <Panel
      as="footer"
      density="md"
      surfaceClassName="bg-white/40"
      className="mt-1 grid h-min min-w-0 gap-2 text-[#5d6d88] xl:grid-cols-[minmax(0,1fr)_220px_220px]"
    >
      <p className="m-0 inline-flex items-center gap-2 text-ui-sm">
        <TrendingDown className="size-4" />
        Медицинский страховой отчет
      </p>
      <p className="m-0 text-ui-sm">
        <span className="block text-ui-xs uppercase text-[#8291ab]">ID запроса</span>
        {predictionId}
      </p>
      <p className="m-0 text-ui-sm">
        <span className="block text-ui-xs uppercase text-[#8291ab]">Дата расчета</span>
        {formatDate(createdAt)}
      </p>
    </Panel>
  );
}
