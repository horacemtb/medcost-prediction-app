import { KitButton } from "../../../shared/ui/kit";
import type { PredictFormWidgetProps } from "../model/types";
import { PredictFormTabs } from "./PredictFormTabs";
import { CostsSection } from "./sections/CostsSection";
import { FactorsSection } from "./sections/FactorsSection";
import { LifestyleSection } from "./sections/LifestyleSection";
import { PatientSection } from "./sections/PatientSection";

export function PredictFormWidget({
  tabs,
  activeTab,
  form,
  errors,
  costInput,
  loading,
  chronicCount,
  formPredictionId,
  onTabChange,
  onUpdateField,
  onFullNameBlur,
  onCostInputChange,
  onCostInputBlur,
  onReset,
  onSubmit,
}: PredictFormWidgetProps) {
  const [patientTab, lifestyleTab, factorsTab, costsTab] = tabs;
  const tabSections = {
    [patientTab]: <PatientSection form={form} errors={errors} onUpdateField={onUpdateField} onFullNameBlur={onFullNameBlur} />,
    [lifestyleTab]: <LifestyleSection form={form} errors={errors} onUpdateField={onUpdateField} />,
    [factorsTab]: <FactorsSection form={form} chronicCount={chronicCount} onUpdateField={onUpdateField} />,
    [costsTab]: (
      <CostsSection
        form={form}
        errors={errors}
        costInput={costInput}
        onUpdateField={onUpdateField}
        onCostInputChange={onCostInputChange}
        onCostInputBlur={onCostInputBlur}
      />
    ),
  };

  return (
    <section className="tile form-tile h-fit">
      <h3 className="widget-title mb-3">
        {formPredictionId === null
          ? "Расчет нового пациента"
          : `Перерасчет пациента id ${formPredictionId}`}
      </h3>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PredictFormTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        <div className="top-actions flex flex-wrap items-center gap-2">
          <KitButton type="button" onClick={onReset}>
            Очистить
          </KitButton>
          <KitButton type="button" className="primary" variant="primary" disabled={loading} onClick={onSubmit}>
            {loading ? "Расчет..." : "Рассчитать"}
          </KitButton>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border p-3 md:p-4 [border-color:color-mix(in_srgb,var(--line)_82%,transparent)] [background:color-mix(in_srgb,var(--bg)_90%,#fff_10%)]">{tabSections[activeTab]}</div>
    </section>
  );
}
