import { useEffect, useRef, type ChangeEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../model/types";
import { PredictFormActions } from "./PredictFormActions";
import { RecognizeFormButton } from "./RecognizeFormButton";
import { BasicDataSection } from "./sections/BasicDataSection";
import { MedicalIndicatorsSection } from "./sections/MedicalIndicatorsSection";
import { RiskFactorsSection } from "./sections/RiskFactorsSection";

export function PredictFormWidget({
  form,
  errors,
  costInput,
  loading,
  ocrLoading,
  ocrWarnings,
  ocrError,
  chronicCount,
  formPredictionId,
  onUpdateField,
  onFullNameBlur,
  onCostInputChange,
  onCostInputBlur,
  onReset,
  onSubmit,
  onRecognizeForm,
}: PredictFormWidgetProps) {
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickOcrFile = () => {
    ocrInputRef.current?.click();
  };

  const handleOcrFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onRecognizeForm(file);
    event.target.value = "";
  };

  useEffect(() => {
    if (ocrError) {
      toast.error("Анкета не распознана", {
        id: "ocr-error",
        description: ocrError,
      });
      return;
    }

    if (ocrWarnings.length > 0) {
      toast.warning("Некоторые поля анкеты не распознаны", {
        id: "ocr-warnings",
        description: (
          <ul className="m-0 list-disc space-y-1 pl-4">
            {ocrWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ),
      });
    }
  }, [ocrError, ocrWarnings]);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <input
        ref={ocrInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleOcrFileChange}
      />

      <PageHeader
        title="Данные пациента"
        titleAs="h3"
        description="Эти данные используются для расчета прогнозируемой стоимости лечения и профиля рисков."
        actions={
          <RecognizeFormButton
            loading={ocrLoading}
            onClick={handlePickOcrFile}
          />
        }
      />

      <div className="scroll-transparent mt-5 grid flex-1 min-h-0 grid-cols-1 gap-3 overflow-auto pr-1 lg:grid-cols-[1.1fr_1.5fr]">
        <BasicDataSection
          form={form}
          errors={errors}
          onUpdateField={onUpdateField}
          onFullNameBlur={onFullNameBlur}
        />

        <div className="grid gap-3">
          <RiskFactorsSection
            form={form}
            chronicCount={chronicCount}
            onUpdateField={onUpdateField}
          />
          <MedicalIndicatorsSection
            form={form}
            errors={errors}
            costInput={costInput}
            onUpdateField={onUpdateField}
            onCostInputChange={onCostInputChange}
            onCostInputBlur={onCostInputBlur}
          />
        </div>
      </div>

      <PredictFormActions
        loading={loading}
        formPredictionId={formPredictionId}
        onReset={onReset}
        onSubmit={onSubmit}
      />
    </section>
  );
}
