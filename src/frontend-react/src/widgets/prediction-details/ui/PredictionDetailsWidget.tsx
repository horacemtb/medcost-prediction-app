import { useEffect, useMemo, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import type {
  PredictionAssessmentResponse,
  PredictionDetailsResponse,
} from "../../../shared/types/medcost";
import { KitButton, KitLoader } from "../../../shared/ui/kit";
import { usePredictionDetails } from "../model/PredictionDetailsContext";
import { sortRiskFactors } from "../model/prediction-details-helpers";
import { AnnualForecastBlock } from "./sections/AnnualForecastBlock";
import { FinalAssessmentCard } from "./sections/FinalAssessmentCard";
import { PatientDataCard } from "./sections/PatientDataCard";
import { PredictionDetailsHeader } from "./sections/PredictionDetailsHeader";
import { RecommendationCard } from "./sections/RecommendationCard";
import { ReportMetaFooter } from "./sections/ReportMetaFooter";
import { RiskFactorsCard } from "./sections/RiskFactorsCard";

type PredictionDetailsWidgetProps = {
  hideCloseButton?: boolean;
  hideActionsDropdown?: boolean;
  onRecalculate?: (details: PredictionDetailsResponse) => void;
  onDelete?: (details: PredictionDetailsResponse) => void;
  onExport?: (details: PredictionDetailsResponse) => void;
};

export function PredictionDetailsWidget({
  onRecalculate,
  onExport,
}: PredictionDetailsWidgetProps) {
  const { open, details, loading, error, retryPredictionDetails } =
    usePredictionDetails();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });
  const [assessment, setAssessment] =
    useState<PredictionAssessmentResponse | null>(null);
  const showWidget =
    open || visibleLoading || Boolean(details) || Boolean(error);

  const sortedFactors = useMemo(
    () => (details ? sortRiskFactors(details) : []),
    [details],
  );

  const riskCategory = assessment?.risk_category ?? null;
  const riskTone =
    riskCategory === "Высокий риск" || riskCategory === "Экстремальный риск (топ-5%)"
      ? "bg-[#ffe3e3] text-[#b42318]"
      : riskCategory === "Стандартный"
        ? "bg-[#fff2d8] text-[#8f5a00]"
        : "bg-[#e7f8ee] text-[#18794e]";

  const percentile = assessment?.percentile ?? null;

  useEffect(() => {
    let active = true;
    if (!details) {
      setAssessment(null);
      return () => {
        active = false;
      };
    }

    void medcostApi
      .assessment(details.prediction_id)
      .then((res) => {
        if (active) setAssessment(res);
      })
      .catch(() => {
        if (active) setAssessment(null);
      });

    return () => {
      active = false;
    };
  }, [details]);

  if (!showWidget) return null;

  return (
    <section className="relative flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-x-hidden">
      {visibleLoading && (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="loading-card">
            <KitLoader label="Загрузка отчета анализа..." />
          </div>
        </div>
      )}
      {!details && error ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-muted">
          <p>{error.includes("404") ? "Прогноз не найден." : error}</p>
          <KitButton
            type="button"
            variant="primary"
            onClick={retryPredictionDetails}
          >
            Повторить
          </KitButton>
        </div>
      ) : details ? (
        <>
          <PredictionDetailsHeader
            details={details}
            onRecalculate={onRecalculate}
            onExport={onExport}
          />

          <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-auto overflow-x-hidden pr-1">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_32%]">
              <AnnualForecastBlock
                predictionId={details.prediction_id}
                predictedCost={details.predicted_cost}
                riskLevel={riskCategory ?? "Нет данных"}
                riskTone={riskTone}
              />

              <RecommendationCard
                createdAt={details.created_at}
                riskProfileCategory={riskCategory}
                title={assessment?.recommendation_title}
                description={assessment?.recommendation_description}
              />
            </div>
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_50%]">
              <RiskFactorsCard factors={sortedFactors} />

              <div className="grid min-w-0 gap-4">
                <PatientDataCard details={details} />
                <FinalAssessmentCard
                  percentile={percentile}
                  riskCategory={riskCategory}
                />
              </div>
            </div>

            <div className="mt-auto">
              <ReportMetaFooter
                predictionId={details.prediction_id}
                createdAt={details.created_at}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-[220px]" />
      )}
    </section>
  );
}
