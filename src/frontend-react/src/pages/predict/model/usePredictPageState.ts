import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { medcostApi } from "../../../shared/api/medcost-api";
import { exportPredictionPdf } from "../../../shared/lib/export-prediction-pdf";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import type {
  PredictionDetailsResponse,
  PredictionResponse,
} from "../../../shared/types/medcost";
import { usePredictionDetails } from "../../../widgets/prediction-details";
import {
  initialPredictForm,
  mapPredictionDetailsToForm,
  normalizeName,
  parseMoney,
  predictTabs,
  toPredictionPayload,
  type PredictFormErrors,
  type PredictFormState,
  type PredictTabId,
  validatePredictForm,
} from "./predict-form";

export function usePredictPageState() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<PredictFormState>(initialPredictForm);
  const [activeTab, setActiveTab] = useState<PredictTabId>(predictTabs[0]);
  const [costInput, setCostInput] = useState(
    initialPredictForm.previous_year_cost.toLocaleString("ru-RU"),
  );
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [formPredictionId, setFormPredictionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<PredictFormErrors>({});
  const { openPredictionDetails, closePredictionDetails } =
    usePredictionDetails();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });

  useEffect(() => {
    const state = location.state as {
      prefillDetails?: PredictionDetailsResponse;
    } | null;
    const details = state?.prefillDetails;
    if (!details) return;

    const nextForm = mapPredictionDetailsToForm(details);
    setForm(nextForm);
    setCostInput(nextForm.previous_year_cost.toLocaleString("ru-RU"));
    setResult(null);
    setFormPredictionId(details.prediction_id);
    setErrors({});
    setError("");
    closePredictionDetails();

    navigate(location.pathname, { replace: true, state: null });
  }, [closePredictionDetails, location.pathname, location.state, navigate]);

  const chronicCount = useMemo(
    () =>
      [
        form.smoker,
        form.diabetes,
        form.hypertension,
        form.heart_disease,
        form.asthma,
      ].filter(Boolean).length,
    [
      form.smoker,
      form.diabetes,
      form.hypertension,
      form.heart_disease,
      form.asthma,
    ],
  );

  const updateField = useCallback(
    <K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const handleCostInputChange = useCallback(
    (value: string) => {
      const numeric = parseMoney(value);
      setCostInput(numeric ? numeric.toLocaleString("ru-RU") : "");
      updateField("previous_year_cost", numeric);
    },
    [updateField],
  );

  const handleCostInputBlur = useCallback(() => {
    setCostInput(form.previous_year_cost.toLocaleString("ru-RU"));
  }, [form.previous_year_cost]);

  const handleReset = useCallback(() => {
    setForm(initialPredictForm);
    setCostInput(initialPredictForm.previous_year_cost.toLocaleString("ru-RU"));
    setResult(null);
    setFormPredictionId(null);
    setErrors({});
    setError("");
    closePredictionDetails();
  }, [closePredictionDetails]);

  const submit = useCallback(async () => {
    const normalized = { ...form, full_name: normalizeName(form.full_name) };
    const validationErrors = validatePredictForm(normalized);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setError("");
    setLoading(true);
    try {
      const nextResult =
        formPredictionId === null
          ? await medcostApi.predict(toPredictionPayload(normalized))
          : await medcostApi.recalculatePrediction(
              formPredictionId,
              toPredictionPayload(normalized),
            );
      setForm(normalized);
      setFormPredictionId(nextResult.prediction_id);
      setResult(nextResult);
      openPredictionDetails(nextResult.prediction_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [form, formPredictionId, openPredictionDetails]);

  const recalculate = useCallback(() => {
    if (!result) return;
    setFormPredictionId(result.prediction_id);
    setResult(null);
    setError("");
    setErrors({});
    closePredictionDetails();
  }, [closePredictionDetails, result]);

  const deleteCurrentPrediction = useCallback(async () => {
    if (!result) return;
    setError("");
    setLoading(true);
    try {
      await medcostApi.deleteHistory(result.prediction_id);
      handleReset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [handleReset, result]);

  const exportPrediction = useCallback((details: PredictionDetailsResponse) => {
    exportPredictionPdf(details);
  }, []);

  return {
    predictTabs,
    form,
    activeTab,
    setActiveTab,
    costInput,
    result,
    visibleLoading,
    error,
    errors,
    chronicCount,
    hasCalculated: Boolean(result),
    formPredictionId,
    updateField,
    handleCostInputChange,
    handleCostInputBlur,
    handleReset,
    submit,
    recalculate,
    deleteCurrentPrediction,
    exportPrediction,
  };
}
