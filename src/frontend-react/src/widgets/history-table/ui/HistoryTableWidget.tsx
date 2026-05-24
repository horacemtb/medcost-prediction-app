import { memo, useMemo, useState } from "react";
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
import { Modal } from "../../../shared/ui/modal";
import refreshIcon from "../../../shared/assets/refresh.svg";
import { HistoryRow } from "./HistoryRow";

type SortKey =
  | "id"
  | "full_name"
  | "snils"
  | "age"
  | "predicted_cost"
  | "created_at";

type HistoryTableWidgetProps = {
  items: HistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => Promise<void> | void;
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
  const [pendingDeleteItem, setPendingDeleteItem] = useState<HistoryItem | null>(
    null,
  );
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const stickyHeaderCellClass = useMemo(
    () =>
      "sticky top-0 z-20 bg-[#f6f8fd]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f6f8fd]/80",
    [],
  );

  async function handleConfirmDelete() {
    if (!pendingDeleteItem || deleteInProgress) return;

    setDeleteInProgress(true);
    try {
      await Promise.resolve(onDelete(pendingDeleteItem.id));
      setPendingDeleteItem(null);
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <>
      <section className="tile grid h-full min-h-0 grid-cols-1 gap-2 bg-white/70 [grid-template-rows:auto_minmax(0,1fr)]">
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
            <KitTable className="min-w-[1020px] duration-300 ease-in-out min-[1400px]:w-full">
              <colgroup>
                <col className="w-[120px]" />
                <col className="w-[220px]" />
                <col className="w-[170px]" />
                <col className="w-[100px]" />
                <col className="w-[160px]" />
                <col className="w-[190px]" />
                <col className="w-[120px]" />
              </colgroup>
              <KitTableHead>
                <KitTableRow>
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
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
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
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
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
                    <KitButton
                      type="button"
                      style={{ padding: 0 }}
                      className="sort-btn w-full justify-start text-left"
                      variant="sort"
                      size={24}
                      onClick={() => onSort("snils")}
                    >
                      СНИЛС {sortIndicator("snils")}
                    </KitButton>
                  </KitTableHeaderCell>
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
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
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
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
                  <KitTableHeaderCell className={stickyHeaderCellClass}>
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
                  <KitTableHeaderCell className={stickyHeaderCellClass} />
                </KitTableRow>
              </KitTableHead>
              <KitTableBody>
                {items.map((item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                    onOpen={onOpen}
                    onDelete={() => setPendingDeleteItem(item)}
                    onRecalculate={onRecalculate}
                  />
                ))}
                {!loading && !items.length && (
                  <KitTableRow>
                    <KitTableCell
                      colSpan={7}
                      className="py-4 text-center text-ui-sm text-muted"
                    >
                      Ничего не найдено по текущим фильтрам.
                    </KitTableCell>
                  </KitTableRow>
                )}
              </KitTableBody>
            </KitTable>
          </KitTableScroll>
        </div>
      </section>

      <Modal
        open={pendingDeleteItem !== null}
        title="Удалить запись из истории?"
        kicker="Подтверждение действия"
        onClose={() => {
          if (!deleteInProgress) {
            setPendingDeleteItem(null);
          }
        }}
        footer={
          <>
            <KitButton
              type="button"
              variant="default"
              className="min-w-[108px] border-[#cdd7e6] bg-white/90 text-[#1f2c44] shadow-sm hover:border-[#9fb2cf] hover:bg-[#eef3fb]"
              onClick={() => setPendingDeleteItem(null)}
              disabled={deleteInProgress}
            >
              Нет
            </KitButton>
            <KitButton
              type="button"
              variant="danger"
              onClick={() => {
                void handleConfirmDelete();
              }}
              disabled={deleteInProgress}
            >
              {deleteInProgress ? "Удаление..." : "Да, удалить"}
            </KitButton>
          </>
        }
      >
        {pendingDeleteItem ? (
          <div className="grid gap-3">
            <p className="m-0">
              Вы собираетесь удалить расчёт пациента{" "}
              <span className="font-semibold text-[#1a2741]">
                {pendingDeleteItem.full_name}
              </span>
              .
            </p>
            <div className="rounded-2xl border border-[#dce4ef] bg-white/70 px-4 py-3">
              <p className="m-0 text-ui-xs uppercase tracking-[0.18em] text-[#6b7d99]">
                Детали записи
              </p>
              <p className="m-0 mt-2 text-ui-sm text-[#1f2c44]">
                ID: {pendingDeleteItem.id}
              </p>
              <p className="m-0 text-ui-sm text-[#1f2c44]">
                СНИЛС: {pendingDeleteItem.snils}
              </p>
            </div>
            <p className="m-0 text-ui-sm text-[#6b7d99]">
              Действие необратимо. Если вы не уверены, нажмите «Нет».
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
});
