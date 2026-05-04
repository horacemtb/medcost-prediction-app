import type {
  PredictionDetailsResponse,
  PredictionResponse,
} from "../../../shared/types/medcost";
import { PredictionActionsPanel } from "../../../widgets/predict-actions";
import { PredictionDetailsWidget } from "../../../widgets/prediction-details";

type PredictResultViewProps = {
  result: PredictionResponse;
  previousYearCost: number;
  loading: boolean;
  onExport: (details: PredictionDetailsResponse) => void;
  onCreateNew: () => void;
  onRecalculate: () => void;
  onDelete: () => void;
};

export function PredictResultView({
  result,
  previousYearCost,
  loading,
  onExport,
  onCreateNew,
  onRecalculate,
  onDelete,
}: PredictResultViewProps) {
  return (
    <>
      <div className="predict-main-column h-full min-h-0 overflow-hidden">
        <PredictionDetailsWidget
          hideCloseButton
          onExport={onExport}
          hideActionsDropdown
          onRecalculate={onRecalculate}
          onDelete={onDelete}
        />
      </div>
      <aside className="predict-side-widget h-fit">
        <PredictionActionsPanel
          result={result}
          previousYearCost={previousYearCost}
          busy={loading}
          onCreateNew={onCreateNew}
          onRecalculate={onRecalculate}
          onDelete={onDelete}
        />
      </aside>
    </>
  );
}
