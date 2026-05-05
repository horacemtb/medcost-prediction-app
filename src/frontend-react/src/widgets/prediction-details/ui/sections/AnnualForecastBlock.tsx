import { ChartColumnBig } from "lucide-react";
import { formatMoney } from "../../model/prediction-details-helpers";

type AnnualForecastBlockProps = {
  predictionId: number;
  predictedCost: number;
  riskLevel: string | null;
  riskTone: string;
};

export function AnnualForecastBlock({
  predictionId,
  predictedCost,
  riskLevel,
  riskTone,
}: AnnualForecastBlockProps) {
  return (
    <div className="min-w-0 p-1">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-3">
          <span className="inline-grid size-11 place-items-center rounded-xl bg-[#0d1f49] text-white">
            <ChartColumnBig className="size-5" />
          </span>
          <div>
            <p className="m-0 text-ui-xs uppercase tracking-[0.2em] text-[#7f8ba4]">
              Годовой прогноз
            </p>
            <p className="m-0 mt-1 text-ui-sm font-semibold text-[#1a2a47]">
              Пациент #{predictionId}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-ui-xs font-semibold ${riskTone}`}
        >
          {riskLevel}
        </span>
      </div>

      <div className="mt-8">
        <p className="m-0 text-ui-kpi text-[#071634]">
          {formatMoney(predictedCost)}
          <span className="ml-2 text-ui-sm font-semibold">₽</span>
          <span className="ml-2 text-ui-sm font-medium text-[#4a5974]">
            / в год
          </span>
        </p>
        <p className="m-0 mt-4 max-w-[640px] text-ui-xs text-[#5a6882]">
          Ориентировочный годовой прогноз медицинских расходов на основе данных
          пациента и модели оценки страхового риска.
        </p>
      </div>
    </div>
  );
}
