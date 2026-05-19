import type {
  PredictionDetailsResponse,
  PredictionResponse,
} from "../../../shared/types/medcost";
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
  result: _result,
  previousYearCost: _previousYearCost,
  loading: _loading,
  onExport,
  onCreateNew: _onCreateNew,
  onRecalculate,
  onDelete,
}: PredictResultViewProps) {
  return (
    <div className="scroll-transparent predict-main-column h-full min-h-0 overflow-auto">
      <PredictionDetailsWidget
        hideCloseButton
        onExport={onExport}
        hideActionsDropdown
        onRecalculate={onRecalculate}
        onDelete={onDelete}
      />
    </div>
  );
}
