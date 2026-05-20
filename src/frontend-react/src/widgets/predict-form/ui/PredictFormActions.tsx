import { Calculator, ShieldCheck } from "lucide-react";
import { KitButton } from "../../../shared/ui/kit";

type PredictFormActionsProps = {
  loading: boolean;
  formPredictionId: number | null;
  onReset: () => void;
  onSubmit: () => void;
};

export function PredictFormActions({
  loading,
  formPredictionId,
  onReset,
  onSubmit,
}: PredictFormActionsProps) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        <KitButton
          type="button"
          onClick={onReset}
          className="h-11 min-w-[260px] rounded-xl bg-[#142f6b] text-ui-md font-semibold hover:brightness-110"
        >
          Очистить
        </KitButton>
        <KitButton
          type="button"
          className="h-11 min-w-[260px] rounded-xl bg-[#142f6b] text-ui-md font-semibold hover:brightness-110"
          variant="primary"
          disabled={loading}
          onClick={onSubmit}
        >
          <Calculator className="size-4" />
          {loading ? "Расчет..." : "Рассчитать"}
        </KitButton>
      </div>
      <p className="inline-flex items-center gap-1 text-ui-xs text-muted">
        <ShieldCheck className="size-3.5" />
        {formPredictionId === null
          ? "Прогноз на основе модели PrecisionAI v3.0"
          : `Перерасчет пациента id ${formPredictionId}`}
      </p>
    </div>
  );
}
