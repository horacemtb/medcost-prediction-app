import { featureMap } from "../../../../shared/config/feature-map";
import { KitCheckbox } from "../../../../shared/ui/kit";
import type { PredictFormState } from "../../../../pages/predict/model/predict-form";

type FactorsSectionProps = {
  form: PredictFormState;
  chronicCount: number;
  onUpdateField: <K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) => void;
};

export function FactorsSection({ form, chronicCount, onUpdateField }: FactorsSectionProps) {
  return (
    <div className="form-section">
      <div className="flex gap-2">
        {(["smoker", "diabetes", "hypertension", "heart_disease", "asthma"] as const).map((k) => (
          <KitCheckbox
            key={k}
            label={featureMap[k]}
            checked={form[k]}
            onChange={(e) => onUpdateField(k, e.target.checked)}
          />
        ))}
      </div>
      <small className="mt-3 block text-xs text-muted">
        {chronicCount ? `Отмечено факторов: ${chronicCount}` : "Факторы не выбраны"}
      </small>
    </div>
  );
}
