import { ErrorAlert } from "../../../shared/ui/kit";
import { HistoryFiltersWidget } from "../../../widgets/history-filters/ui/HistoryFiltersWidget";
import { HistoryTableWidget } from "../../../widgets/history-table/ui/HistoryTableWidget";
import { PredictionDetailsWidget } from "../../../widgets/prediction-details";
import { useHistoryPageState } from "../model/useHistoryPageState";

export function HistoryPage() {
  const state = useHistoryPageState();

  return (
    <section
      className={`page-shell grid grid-cols-1 gap-3 ${state.renderDetailsWidget ? "lg:grid-cols-[minmax(0,1fr)_420px]" : ""}`.trim()}
    >
      <div className="flex min-h-0 min-w-0 w-full flex-col gap-3">
        {state.error && <ErrorAlert message={state.error} />}
        <div className="w-full lg:w-auto">
          <HistoryFiltersWidget
            costMin={state.costMin}
            costMax={state.costMax}
            dateFrom={state.dateFrom}
            dateTo={state.dateTo}
            shownCount={state.filteredAndSorted.length}
            onCostMinChange={state.setCostMin}
            onCostMaxChange={state.setCostMax}
            onDateFromChange={state.setDateFrom}
            onDateToChange={state.setDateTo}
            onReset={state.resetFilters}
          />
        </div>

        <div className="min-h-0 w-full min-w-0 flex-1">
          <HistoryTableWidget
            items={state.filteredAndSorted}
            loading={state.visibleLoading}
            onRefresh={state.loadHistory}
            onDelete={state.removeItem}
            onRecalculate={(id) => {
              void state.handleRecalculateFromTable(id);
            }}
            onSort={state.toggleSort}
            sortIndicator={state.sortIndicator}
          />
        </div>
      </div>
      {state.renderDetailsWidget && (
        <PredictionDetailsWidget
          onExport={state.handleExportFromDetails}
          onRecalculate={state.handleRecalculateFromDetails}
          onDelete={state.handleDeleteFromDetails}
        />
      )}
    </section>
  );
}
