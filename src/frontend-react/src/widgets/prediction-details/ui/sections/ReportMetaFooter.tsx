import { TrendingDown } from "lucide-react";
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
    <div className="h-min mt-1 grid min-w-0 gap-2 rounded-2xl border border-line/70 bg-white/40 p-4 text-[#5d6d88] xl:grid-cols-[minmax(0,1fr)_220px_220px]">
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
    </div>
  );
}
