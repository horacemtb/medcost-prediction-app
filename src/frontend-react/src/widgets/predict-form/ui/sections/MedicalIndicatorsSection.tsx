import { Activity } from "lucide-react";
import { parseNumberInput } from "../../../../shared/lib/form-values";
import { FormField, KitInput, SectionCard } from "../../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../../model/types";

type MedicalIndicatorsSectionProps = Pick<
  PredictFormWidgetProps,
  | "form"
  | "errors"
  | "costInput"
  | "onUpdateField"
  | "onCostInputChange"
  | "onCostInputBlur"
>;

export function MedicalIndicatorsSection({
  form,
  errors,
  costInput,
  onUpdateField,
  onCostInputChange,
  onCostInputBlur,
}: MedicalIndicatorsSectionProps) {
  return (
    <SectionCard title="3. Поведенческие и медицинские показатели" icon={Activity}>
      <FormField
        label="Уровень стресса"
        error={errors.stress_level}
        className="mb-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-ui-xs text-muted">1</span>
          <input
            className="h-1.5 flex-1 accent-[#4f6ff2]"
            type="range"
            min={1}
            max={10}
            step={1}
            value={form.stress_level}
            aria-invalid={Boolean(errors.stress_level)}
            onChange={(e) =>
              onUpdateField("stress_level", parseNumberInput(e.target.value))
            }
          />
          <span className="text-ui-xs text-muted">10</span>
          <span className="min-w-6 text-right text-ui-sm font-semibold text-[#4f6ff2]">
            {form.stress_level}
          </span>
        </div>
      </FormField>

      <div className="grid gap-3">
        <FormField label="Визитов к врачу в год">
          <KitInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={
              form.doctor_visits_per_year === 0
                ? ""
                : form.doctor_visits_per_year
            }
            onChange={(e) =>
              onUpdateField(
                "doctor_visits_per_year",
                parseNumberInput(e.target.value),
              )
            }
          />
        </FormField>

        <FormField label="Госпитализаций">
          <KitInput
            type="number"
            min={0}
            max={50}
            step={1}
            value={form.hospital_admissions === 0 ? "" : form.hospital_admissions}
            onChange={(e) =>
              onUpdateField(
                "hospital_admissions",
                parseNumberInput(e.target.value),
              )
            }
          />
        </FormField>

        <FormField label="Количество лекарств">
          <KitInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={form.medication_count === 0 ? "" : form.medication_count}
            onChange={(e) =>
              onUpdateField("medication_count", parseNumberInput(e.target.value))
            }
          />
        </FormField>

        <FormField
          label="Расходы за прошлый год"
          error={errors.previous_year_cost}
        >
          <KitInput
            inputMode="numeric"
            value={costInput}
            aria-invalid={Boolean(errors.previous_year_cost)}
            onChange={(e) => onCostInputChange(e.target.value)}
            onBlur={onCostInputBlur}
          />
        </FormField>
      </div>
    </SectionCard>
  );
}
