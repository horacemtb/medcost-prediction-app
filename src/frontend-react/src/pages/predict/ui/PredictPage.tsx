import { useMemo, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import { ErrorAlert } from "../../../shared/ui/kit";
import {
  initialPredictForm,
  normalizeName,
  parseMoney,
  predictTabs,
  toPredictionPayload,
  type PredictFormErrors,
  type PredictFormState,
  type PredictTabId,
  validatePredictForm,
} from "../model/predict-form";
import { PredictionDetailsWidget, usePredictionDetailsModal } from "../../../widgets/prediction-details-modal";
import { PredictFormWidget } from "../../../widgets/predict-form/ui/PredictFormWidget";
import { PredictSummaryWidget } from "../../../widgets/predict-summary/ui/PredictSummaryWidget";

export function PredictPage() {
  const [form, setForm] = useState<PredictFormState>(initialPredictForm);
  const [activeTab, setActiveTab] = useState<PredictTabId>("Пациент");
  const [costInput, setCostInput] = useState(initialPredictForm.previous_year_cost.toLocaleString("ru-RU"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<PredictFormErrors>({});
  const { openPredictionDetails, closePredictionDetails } = usePredictionDetailsModal();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });

  const chronicCount = useMemo(
    () => [form.smoker, form.diabetes, form.hypertension, form.heart_disease, form.asthma].filter(Boolean).length,
    [form.smoker, form.diabetes, form.hypertension, form.heart_disease, form.asthma]
  );

  function updateField<K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCostInputChange(value: string) {
    const numeric = parseMoney(value);
    setCostInput(numeric ? numeric.toLocaleString("ru-RU") : "");
    updateField("previous_year_cost", numeric);
  }

  function handleCostInputBlur() {
    setCostInput(form.previous_year_cost.toLocaleString("ru-RU"));
  }

  function handleReset() {
    setForm(initialPredictForm);
    setCostInput(initialPredictForm.previous_year_cost.toLocaleString("ru-RU"));
    setErrors({});
    setError("");
    closePredictionDetails();
  }

  async function submit() {
    const normalized = { ...form, full_name: normalizeName(form.full_name) };
    const validationErrors = validatePredictForm(normalized);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setError("");
    setLoading(true);
    try {
      const result = await medcostApi.predict(toPredictionPayload(normalized));
      setForm(normalized);
      openPredictionDetails(result.prediction_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-main">
      {error && <ErrorAlert message={error} />}
      <div className="predict-page-layout">
        <div className="predict-main-column">
          <PredictFormWidget
            tabs={predictTabs}
            activeTab={activeTab}
            form={form}
            errors={errors}
            costInput={costInput}
            loading={visibleLoading}
            chronicCount={chronicCount}
            onTabChange={setActiveTab}
            onUpdateField={updateField}
            onFullNameBlur={(value) => updateField("full_name", normalizeName(value))}
            onCostInputChange={handleCostInputChange}
            onCostInputBlur={handleCostInputBlur}
            onReset={handleReset}
            onSubmit={submit}
          />
        </div>

        <aside className="predict-side-widget">
          <PredictSummaryWidget form={form} chronicCount={chronicCount} />
          <PredictionDetailsWidget />
        </aside>
      </div>
    </section>
  );
}
