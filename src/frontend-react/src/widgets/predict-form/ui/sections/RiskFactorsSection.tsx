import { HeartPulse } from "lucide-react";
import { featureMap } from "../../../../shared/config/feature-map";
import { KitCheckbox, SectionCard } from "../../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../../model/types";

type RiskFactorsSectionProps = Pick<
  PredictFormWidgetProps,
  "form" | "chronicCount" | "onUpdateField"
>;

const RISK_FACTOR_KEYS = [
  "smoker",
  "diabetes",
  "hypertension",
  "heart_disease",
  "asthma",
] as const;

export function RiskFactorsSection({
  form,
  chronicCount,
  onUpdateField,
}: RiskFactorsSectionProps) {
  return (
    <SectionCard title="2. Сопутствующие факторы" icon={HeartPulse}>
      <div className="grid gap-2">
        {RISK_FACTOR_KEYS.map((key) => (
          <KitCheckbox
            key={key}
            label={featureMap[key]}
            checked={form[key]}
            className="w-full justify-start border-line/60 bg-white/65"
            onChange={(e) => onUpdateField(key, e.target.checked)}
          />
        ))}
      </div>
      <small className="mt-2 block text-ui-xs text-muted">
        {chronicCount
          ? `Отмечено факторов: ${chronicCount}`
          : "Факторы не выбраны"}
      </small>
    </SectionCard>
  );
}
