import { useEffect, useRef } from "react";
import { ErrorAlert } from "../../../shared/ui/kit";
import { PredictFormWidget } from "../../../widgets/predict-form/ui/PredictFormWidget";
import { PredictSummaryWidget } from "../../../widgets/predict-summary/ui/PredictSummaryWidget";
import { normalizeName } from "../model/predict-form";
import { usePredictPageState } from "../model/usePredictPageState";
import { PredictResultView } from "./PredictResultView";

export function PredictPage() {
  const state = usePredictPageState();
  const summaryRef = useRef<HTMLElement | null>(null);
  const summaryProps = {
    form: state.form,
    chronicCount: state.chronicCount,
    ocrLoading: state.visibleOcrLoading,
    ocrWarnings: state.ocrWarnings,
    ocrError: state.ocrError,
  } as const;

  useEffect(() => {
    if (!state.shouldScrollToSummary) return;

    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    state.resetShouldScrollToSummary();
  }, [state.resetShouldScrollToSummary, state.shouldScrollToSummary]);

  return (
    <section className="page-shell">
      {state.error && <ErrorAlert message={state.error} />}
      <div className="grid h-full min-h-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        {!state.hasCalculated ? (
          <>
            <div className="predict-main-column">
              <PredictFormWidget
                tabs={state.predictTabs}
                activeTab={state.activeTab}
                form={state.form}
                errors={state.errors}
                costInput={state.costInput}
                loading={state.visibleLoading}
                chronicCount={state.chronicCount}
                formPredictionId={state.formPredictionId}
                onTabChange={state.setActiveTab}
                onUpdateField={state.updateField}
                onFullNameBlur={(value) =>
                  state.updateField("full_name", normalizeName(value))
                }
                onCostInputChange={state.handleCostInputChange}
                onCostInputBlur={state.handleCostInputBlur}
                onReset={state.handleReset}
                onSubmit={state.submit}
              />
            </div>

            <aside ref={summaryRef} className="predict-side-widget">
              <PredictSummaryWidget {...(summaryProps as any)} />
            </aside>
          </>
        ) : (
          state.result && (
            <PredictResultView
              result={state.result}
              previousYearCost={state.form.previous_year_cost}
              loading={state.visibleLoading}
              onExport={state.exportPrediction}
              onCreateNew={state.handleReset}
              onRecalculate={state.recalculate}
              onDelete={state.deleteCurrentPrediction}
            />
          )
        )}
      </div>
    </section>
  );
}
