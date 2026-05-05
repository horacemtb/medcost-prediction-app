import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { medcostApi } from "../../../shared/api/medcost-api";
import { consumePendingOcrFile } from "../../../shared/lib/pending-ocr-file";
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

const fieldAliases: Record<keyof PredictFormState, string[]> = {
  full_name: ["full_name", "fullName", "fio", "name"],
  age: ["age"],
  gender: ["gender", "sex"],
  bmi: ["bmi"],
  smoker: ["smoker", "smoking"],
  diabetes: ["diabetes"],
  hypertension: ["hypertension", "high_blood_pressure"],
  heart_disease: ["heart_disease", "heartDisease"],
  asthma: ["asthma"],
  physical_activity_label: [
    "physical_activity_label",
    "physical_activity_level",
    "physicalActivityLevel",
  ],
  daily_steps: ["daily_steps", "dailySteps", "steps"],
  sleep_hours: ["sleep_hours", "sleepHours"],
  stress_level: ["stress_level", "stressLevel"],
  doctor_visits_per_year: [
    "doctor_visits_per_year",
    "doctorVisitsPerYear",
    "doctor_visits",
  ],
  hospital_admissions: ["hospital_admissions", "hospitalAdmissions"],
  medication_count: ["medication_count", "medicationCount"],
  city_type_label: ["city_type_label", "city_type", "cityType"],
  previous_year_cost: ["previous_year_cost", "previousYearCost", "cost"],
};

function pickField(
  fields: Record<string, unknown>,
  aliases: string[],
): unknown {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(fields, alias)) {
      return fields[alias];
    }
  }
  return undefined;
}

function toNumberSafe(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").replace(/[^\d.\-]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBooleanSafe(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "да"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "нет"].includes(normalized)) return false;
  }
  return fallback;
}

function toStringSafe(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function mapGender(value: unknown, fallback: PredictFormState["gender"]) {
  if (typeof value === "number") {
    return value === 1 ? "Мужской" : value === 0 ? "Женский" : fallback;
  }
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "male", "man", "муж", "мужской"].includes(normalized)) {
    return "Мужской";
  }
  if (["0", "female", "woman", "жен", "женский"].includes(normalized)) {
    return "Женский";
  }
  return fallback;
}

function mapPhysicalActivityLabel(
  value: unknown,
  fallback: PredictFormState["physical_activity_label"],
) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["high", "высокий"].includes(normalized)) return "Высокий";
  if (["low", "низкий"].includes(normalized)) return "Низкий";
  if (["medium", "средний"].includes(normalized)) return "Средний";
  return fallback;
}

function mapCityTypeLabel(
  value: unknown,
  fallback: PredictFormState["city_type_label"],
) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["urban", "город"].includes(normalized)) return "Город";
  if (["semi-urban", "suburban", "пригород"].includes(normalized)) {
    return "Пригород";
  }
  if (["rural", "сельская местность", "село"].includes(normalized)) {
    return "Сельская местность";
  }
  return fallback;
}

export function usePredictPageState() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<PredictFormState>(initialPredictForm);
  const [activeTab, setActiveTab] = useState<PredictTabId>(predictTabs[0]);
  const [costInput, setCostInput] = useState(
    initialPredictForm.previous_year_cost
      ? initialPredictForm.previous_year_cost.toLocaleString("ru-RU")
      : "",
  );
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [formPredictionId, setFormPredictionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [errors, setErrors] = useState<PredictFormErrors>({});
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  const [ocrRawText, setOcrRawText] = useState("");
  const [shouldScrollToSummary, setShouldScrollToSummary] = useState(false);
  const { openPredictionDetails, closePredictionDetails } =
    usePredictionDetails();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });
  const visibleOcrLoading = useMinimumLoading(ocrLoading, { minMs: 1000 });

  const applyOcrFields = useCallback((fields: Record<string, unknown>) => {
    setForm((prev) => ({
      ...prev,
      full_name: toStringSafe(
        pickField(fields, fieldAliases.full_name),
        prev.full_name,
      ),
      age: toNumberSafe(pickField(fields, fieldAliases.age), prev.age),
      gender: mapGender(pickField(fields, fieldAliases.gender), prev.gender),
      bmi: toNumberSafe(pickField(fields, fieldAliases.bmi), prev.bmi),
      smoker: toBooleanSafe(
        pickField(fields, fieldAliases.smoker),
        prev.smoker,
      ),
      diabetes: toBooleanSafe(
        pickField(fields, fieldAliases.diabetes),
        prev.diabetes,
      ),
      hypertension: toBooleanSafe(
        pickField(fields, fieldAliases.hypertension),
        prev.hypertension,
      ),
      heart_disease: toBooleanSafe(
        pickField(fields, fieldAliases.heart_disease),
        prev.heart_disease,
      ),
      asthma: toBooleanSafe(
        pickField(fields, fieldAliases.asthma),
        prev.asthma,
      ),
      physical_activity_label: mapPhysicalActivityLabel(
        pickField(fields, fieldAliases.physical_activity_label),
        prev.physical_activity_label,
      ),
      daily_steps: toNumberSafe(
        pickField(fields, fieldAliases.daily_steps),
        prev.daily_steps,
      ),
      sleep_hours: toNumberSafe(
        pickField(fields, fieldAliases.sleep_hours),
        prev.sleep_hours,
      ),
      stress_level: toNumberSafe(
        pickField(fields, fieldAliases.stress_level),
        prev.stress_level,
      ),
      doctor_visits_per_year: toNumberSafe(
        pickField(fields, fieldAliases.doctor_visits_per_year),
        prev.doctor_visits_per_year,
      ),
      hospital_admissions: toNumberSafe(
        pickField(fields, fieldAliases.hospital_admissions),
        prev.hospital_admissions,
      ),
      medication_count: toNumberSafe(
        pickField(fields, fieldAliases.medication_count),
        prev.medication_count,
      ),
      city_type_label: mapCityTypeLabel(
        pickField(fields, fieldAliases.city_type_label),
        prev.city_type_label,
      ),
      previous_year_cost: toNumberSafe(
        pickField(fields, fieldAliases.previous_year_cost),
        prev.previous_year_cost,
      ),
    }));
  }, []);

  useEffect(() => {
    const state = location.state as {
      prefillDetails?: PredictionDetailsResponse;
      ocrError?: string;
      openReport?: boolean;
      forceNew?: boolean;
    } | null;
    if (state?.forceNew) {
      setForm(initialPredictForm);
      setCostInput(
        initialPredictForm.previous_year_cost
          ? initialPredictForm.previous_year_cost.toLocaleString("ru-RU")
          : "",
      );
      setResult(null);
      setFormPredictionId(null);
      setErrors({});
      setError("");
      setOcrError("");
      setOcrWarnings([]);
      setOcrRawText("");
      setShouldScrollToSummary(false);
      closePredictionDetails();
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    const details = state?.prefillDetails;
    if (!details) return;

    const nextForm = mapPredictionDetailsToForm(details);
    setForm(nextForm);
    setCostInput(nextForm.previous_year_cost.toLocaleString("ru-RU"));
    if (state?.openReport) {
      setResult({
        prediction_id: details.prediction_id,
        full_name: details.full_name,
        predicted_cost: details.predicted_cost,
        created_at: details.created_at,
      });
      openPredictionDetails(details.prediction_id);
    } else {
      setResult(null);
    }
    setFormPredictionId(details.prediction_id);
    setErrors({});
    setError("");
    if (!state?.openReport) {
      closePredictionDetails();
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [
    closePredictionDetails,
    location.pathname,
    location.state,
    navigate,
    openPredictionDetails,
  ]);

  useEffect(() => {
    const state = location.state as {
      prefillDetails?: PredictionDetailsResponse;
      ocrError?: string;
    } | null;
    const locationOcrError = state?.ocrError;
    if (!locationOcrError) return;
    setOcrError(locationOcrError);
    setShouldScrollToSummary(true);
    navigate(location.pathname, {
      replace: true,
      state: { prefillDetails: state?.prefillDetails ?? null },
    });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const pendingFile = consumePendingOcrFile();
    if (!pendingFile) return;

    let isCancelled = false;

    const runOcr = async () => {
      setOcrLoading(true);
      setShouldScrollToSummary(true);
      setOcrError("");
      setOcrWarnings([]);
      setOcrRawText("");
      setResult(null);

      try {
        const response = await medcostApi.ocrPatientForm(pendingFile);
        if (isCancelled) return;
        applyOcrFields(response.fields);
        setOcrWarnings(response.warnings ?? []);
        setOcrRawText(response.raw_text ?? "");
      } catch (e) {
        if (isCancelled) return;
        setOcrError(
          e instanceof Error ? e.message : "Не удалось распознать анкету.",
        );
      } finally {
        if (!isCancelled) setOcrLoading(false);
      }
    };

    void runOcr();

    return () => {
      isCancelled = true;
    };
  }, [applyOcrFields, location.key]);

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
    setCostInput(
      form.previous_year_cost ? form.previous_year_cost.toLocaleString("ru-RU") : "",
    );
  }, [form.previous_year_cost]);

  const handleReset = useCallback(() => {
    setForm(initialPredictForm);
    setCostInput(
      initialPredictForm.previous_year_cost
        ? initialPredictForm.previous_year_cost.toLocaleString("ru-RU")
        : "",
    );
    setResult(null);
    setFormPredictionId(null);
    setErrors({});
    setError("");
    setOcrError("");
    setOcrWarnings([]);
    setOcrRawText("");
    setShouldScrollToSummary(false);
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

  const exportPrediction = useCallback(
    async (details: PredictionDetailsResponse) => {
      await exportPredictionPdf(details);
    },
    [],
  );

  const recognizePatientForm = useCallback(
    async (file: File) => {
      setOcrLoading(true);
      setShouldScrollToSummary(true);
      setOcrError("");
      setOcrWarnings([]);
      setOcrRawText("");
      setResult(null);

      try {
        const response = await medcostApi.ocrPatientForm(file);
        applyOcrFields(response.fields);
        setOcrWarnings(response.warnings ?? []);
        setOcrRawText(response.raw_text ?? "");
      } catch (e) {
        setOcrError(
          e instanceof Error ? e.message : "Не удалось распознать анкету.",
        );
      } finally {
        setOcrLoading(false);
      }
    },
    [applyOcrFields],
  );

  const resetShouldScrollToSummary = useCallback(() => {
    setShouldScrollToSummary(false);
  }, []);

  return {
    predictTabs,
    form,
    activeTab,
    setActiveTab,
    costInput,
    result,
    visibleLoading,
    visibleOcrLoading,
    error,
    ocrError,
    ocrWarnings,
    ocrRawText,
    ocrLoading,
    shouldScrollToSummary,
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
    recognizePatientForm,
    resetShouldScrollToSummary,
  };
}
