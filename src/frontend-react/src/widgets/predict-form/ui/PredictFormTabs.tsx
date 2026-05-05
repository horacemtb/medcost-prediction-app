import { KitTabs } from "../../../shared/ui/kit";
import type { PredictTabId } from "../../../pages/predict/model/predict-form";

type PredictFormTabsProps = {
  tabs: readonly PredictTabId[];
  activeTab: PredictTabId;
  onTabChange: (tab: PredictTabId) => void;
};

export function PredictFormTabs({ tabs, activeTab, onTabChange }: PredictFormTabsProps) {
  return (
    <KitTabs
      ariaLabel="Шаги формы"
      items={tabs.map((tab, index) => ({ id: tab, label: `${index + 1}. ${tab}` }))}
      activeId={activeTab}
      onChange={onTabChange}
    />
  );
}
