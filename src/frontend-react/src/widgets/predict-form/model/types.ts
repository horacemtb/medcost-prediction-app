import type { PredictFormErrors, PredictFormState, PredictTabId } from "../../../pages/predict/model/predict-form";

export type PredictFormWidgetProps = {
  tabs: readonly PredictTabId[];
  activeTab: PredictTabId;
  form: PredictFormState;
  errors: PredictFormErrors;
  costInput: string;
  loading: boolean;
  ocrLoading: boolean;
  chronicCount: number;
  formPredictionId: number | null;
  onTabChange: (tab: PredictTabId) => void;
  onUpdateField: <K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) => void;
  onFullNameBlur: (value: string) => void;
  onCostInputChange: (value: string) => void;
  onCostInputBlur: () => void;
  onReset: () => void;
  onSubmit: () => void;
  onRecognizeForm: (file: File) => void;
};
