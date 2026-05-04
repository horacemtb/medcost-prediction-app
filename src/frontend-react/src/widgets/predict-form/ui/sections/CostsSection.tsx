import { FieldMeta, KitInput } from "../../../../shared/ui/kit";
import type {
  PredictFormErrors,
  PredictFormState,
} from "../../../../pages/predict/model/predict-form";

type CostsSectionProps = {
  form: PredictFormState;
  errors: PredictFormErrors;
  costInput: string;
  onUpdateField: <K extends keyof PredictFormState>(
    key: K,
    value: PredictFormState[K],
  ) => void;
  onCostInputChange: (value: string) => void;
  onCostInputBlur: () => void;
};

export function CostsSection({
  form,
  errors,
  costInput,
  onUpdateField,
  onCostInputChange,
  onCostInputBlur,
}: CostsSectionProps) {
  return (
    <div className="form-section">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="flex items-center">Визитов к врачу в год</span>
          <KitInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={form.doctor_visits_per_year}
            onChange={(e) =>
              onUpdateField("doctor_visits_per_year", Number(e.target.value))
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Госпитализаций</span>
          <KitInput
            type="number"
            min={0}
            max={50}
            step={1}
            value={form.hospital_admissions}
            onChange={(e) =>
              onUpdateField("hospital_admissions", Number(e.target.value))
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Количество лекарств</span>
          <KitInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={form.medication_count}
            onChange={(e) =>
              onUpdateField("medication_count", Number(e.target.value))
            }
          />
        </label>

        <label className="flex flex-col">
          <span className="flex items-center">Расходы за прошлый год, ₽</span>
          <KitInput
            inputMode="numeric"
            value={costInput}
            aria-invalid={Boolean(errors.previous_year_cost)}
            onChange={(e) => onCostInputChange(e.target.value)}
            onBlur={onCostInputBlur}
          />
          <FieldMeta error={errors.previous_year_cost} />
        </label>
      </div>
    </div>
  );
}

