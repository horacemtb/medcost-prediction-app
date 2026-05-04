import { PredictFormWidget } from "../../../widgets/predict-form/ui/PredictFormWidget";
import { PredictSummaryWidget } from "../../../widgets/predict-summary/ui/PredictSummaryWidget";
import type {
  PredictFormErrors,
  PredictFormState,
  PredictTabId,
} from "../model/predict-form";

type PredictFormViewProps = {
  tabs: readonly PredictTabId[];
  activeTab: PredictTabId;
  form: PredictFormState;
  errors: PredictFormErrors;
  costInput: string;
  loading: boolean;
  chronicCount: number;
  formPredictionId: number | null;
  onTabChange: (tab: PredictTabId) => void;
  onUpdateField: <K extends keyof PredictFormState>(
    key: K,
    value: PredictFormState[K],
  ) => void;
  onFullNameBlur: (value: string) => void;
  onCostInputChange: (value: string) => void;
  onCostInputBlur: () => void;
  onReset: () => void;
  onSubmit: () => void;
};

export function PredictFormView(props: PredictFormViewProps) {
  const { form, chronicCount } = props;

  return (
    <>
      <div className="predict-main-column">
        <PredictFormWidget {...props} />
      </div>

      <aside className="predict-side-widget">
        <PredictSummaryWidget form={form} chronicCount={chronicCount} />
      </aside>
    </>
  );
}
