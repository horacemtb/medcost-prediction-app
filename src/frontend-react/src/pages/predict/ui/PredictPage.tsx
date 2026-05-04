import { ErrorAlert } from "../../../shared/ui/kit";
import { normalizeName } from "../model/predict-form";
import { usePredictPageState } from "../model/usePredictPageState";
import { PredictFormView } from "./PredictFormView";
import { PredictResultView } from "./PredictResultView";

export function PredictPage() {
  const state = usePredictPageState();

  return (
    <section className="page-shell">
      {state.error && <ErrorAlert message={state.error} />}
      <div className="grid h-full min-h-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        {!state.hasCalculated ? (
          <PredictFormView
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
