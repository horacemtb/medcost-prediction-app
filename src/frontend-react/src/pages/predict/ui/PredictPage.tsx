import { useEffect, useRef } from "react";
import { ErrorAlert, KitBreadcrumbs, KitLoader } from "../../../shared/ui/kit";
import { PredictFormWidget } from "../../../widgets/predict-form/ui/PredictFormWidget";
import { normalizeName } from "../model/predict-form";
import { usePredictPageState } from "../model/usePredictPageState";
import { PredictResultView } from "./PredictResultView";

export function PredictPage() {
  const state = usePredictPageState();
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state.shouldScrollToSummary) return;

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    state.resetShouldScrollToSummary();
  }, [state.resetShouldScrollToSummary, state.shouldScrollToSummary]);

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
      {state.error && <ErrorAlert message={state.error} />}
      <KitBreadcrumbs
        activeIndex={state.hasCalculated ? 1 : 0}
        items={
          [
            { label: "Расчет", to: "/predict", onClick: state.handleReset },
            { label: "Отчет анализа" },
          ]
        }
      />
      <div className="grid h-full min-h-0 grid-cols-1 items-stretch gap-3 overflow-hidden">
        {!state.hasCalculated ? (
          <div ref={formRef} className="predict-main-column relative h-full min-h-0 overflow-hidden pr-1">
            {state.visibleOcrLoading && (
              <div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="loading-card">
                  <KitLoader label="Загрузка анкеты..." />
                </div>
              </div>
            )}
            <PredictFormWidget
              tabs={state.predictTabs}
              activeTab={state.activeTab}
              form={state.form}
              errors={state.errors}
              costInput={state.costInput}
              loading={state.visibleLoading}
              ocrLoading={state.visibleOcrLoading}
              ocrWarnings={state.ocrWarnings}
              ocrError={state.ocrError}
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
              onRecognizeForm={state.recognizePatientForm}
            />
          </div>
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
