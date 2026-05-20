import { memo } from "react";
import type { HistoryItem } from "../../../shared/types/medcost";
import {
  KitButton,
  KitTable,
  KitTableBody,
  KitTableCell,
  KitTableHead,
  KitTableHeaderCell,
  KitTableRow,
  KitTableScroll,
  LoadingState,
} from "../../../shared/ui/kit";
import refreshIcon from "../../../shared/assets/refresh.svg";
import { HistoryRow } from "./HistoryRow";

type SortKey = "id" | "full_name" | "age" | "predicted_cost" | "created_at";

type HistoryTableWidgetProps = {
  items: HistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onRecalculate: (id: number) => void;
  onSort: (key: SortKey) => void;
  sortIndicator: (key: SortKey) => string;
};

export const HistoryTableWidget = memo(function HistoryTableWidget({
  items,
  loading,
  onRefresh,
  onOpen,
  onDelete,
  onRecalculate,
  onSort,
  sortIndicator,
}: HistoryTableWidgetProps) {
  return (
    <section className="tile grid grid-cols-1 h-full min-h-0 gap-2 bg-white/70 md:grid-cols-1 [grid-template-rows:auto_minmax(0,1fr)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="widget-title">Таблица истории</h3>
        <KitButton
          type="button"
          variant="icon"
          size={24}
          onClick={onRefresh}
          disabled={loading}
          aria-label={loading ? "Обновление..." : "Обновить"}
          title={loading ? "Обновление..." : "Обновить"}
        >
          <img
            src={refreshIcon}
            alt=""
            aria-hidden="true"
            className={`h-5 w-5 [filter:var(--nav-icon-filter)] ${loading ? "animate-spin" : ""}`.trim()}
          />
        </KitButton>
      </div>

      <div className="relative h-full min-h-0">
        {loading && (
          <LoadingState
            label="Загрузка истории..."
            cardClassName="history-loading-card"
          />
        )}
        <KitTableScroll className="h-full">
          <KitTable className="min-w-[890px] duration-300 ease-in-out min-[1400px]:w-full">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[200px]" />
              <col className="w-[100px]" />
              <col className="w-[160px]" />
              <col className="w-[190px]" />
              <col className="w-[120px]" />
            </colgroup>
            <KitTableHead className="sticky top-0 z-20">
              <KitTableRow>
                <KitTableHeaderCell className="bg-transparent">
                  <KitButton
                    type="button"
                    style={{ padding: 0 }}
                    className="sort-btn w-full justify-start text-left"
                    variant="sort"
                    size={24}
                    onClick={() => onSort("id")}
                  >
                    ID {sortIndicator("id")}
                  </KitButton>
                </KitTableHeaderCell>
                <KitTableHeaderCell className="bg-transparent">
                  <KitButton
                    type="button"
                    style={{ padding: 0 }}
                    className="sort-btn w-full justify-start text-left"
                    variant="sort"
                    size={24}
                    onClick={() => onSort("full_name")}
                  >
                    ФИО {sortIndicator("full_name")}
                  </KitButton>
                </KitTableHeaderCell>
                <KitTableHeaderCell className="bg-transparent">
                  <KitButton
                    type="button"
                    style={{ padding: 0 }}
                    className="sort-btn w-full justify-start text-left"
                    variant="sort"
                    size={24}
                    onClick={() => onSort("age")}
                  >
                    Возраст {sortIndicator("age")}
                  </KitButton>
                </KitTableHeaderCell>
                <KitTableHeaderCell className="bg-transparent">
                  <KitButton
                    type="button"
                    style={{ padding: 0 }}
                    className="sort-btn w-full justify-start text-left"
                    variant="sort"
                    size={24}
                    onClick={() => onSort("predicted_cost")}
                  >
                    Прогноз {sortIndicator("predicted_cost")}
                  </KitButton>
                </KitTableHeaderCell>
                <KitTableHeaderCell className="bg-transparent">
                  <KitButton
                    type="button"
                    style={{ padding: 0 }}
                    className="sort-btn w-full justify-start text-left"
                    variant="sort"
                    size={24}
                    onClick={() => onSort("created_at")}
                  >
                    Дата {sortIndicator("created_at")}
                  </KitButton>
                </KitTableHeaderCell>
                <KitTableHeaderCell className="bg-transparent" />
              </KitTableRow>
            </KitTableHead>
            <KitTableBody>
              {items.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onOpen={onOpen}
                  onDelete={onDelete}
                  onRecalculate={onRecalculate}
                />
              ))}
              {!loading && !items.length && (
                <KitTableRow>
                  <KitTableCell colSpan={6} className="py-4 text-center text-ui-sm text-muted">
                    Ничего не найдено по текущим фильтрам.
                  </KitTableCell>
                </KitTableRow>
              )}
            </KitTableBody>
          </KitTable>
        </KitTableScroll>
      </div>
    </section>
  );
});
