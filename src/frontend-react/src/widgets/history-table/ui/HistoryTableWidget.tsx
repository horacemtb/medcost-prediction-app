import { memo, useCallback, type MouseEvent } from "react";
import type { HistoryItem } from "../../../shared/types/medcost";
import { KitButton, KitLoader } from "../../../shared/ui/kit";
import deleteIcon from "../../../shared/assets/delete.svg";
import refreshIcon from "../../../shared/assets/refresh.svg";
import calculateIcon from "../../../shared/assets/calculate.svg";

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

type HistoryRowProps = {
  item: HistoryItem;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onRecalculate: (id: number) => void;
};

const HistoryRow = memo(function HistoryRow({
  item,
  onOpen,
  onDelete,
  onRecalculate,
}: HistoryRowProps) {
  const handleOpen = useCallback(() => onOpen(item.id), [item.id, onOpen]);
  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete(item.id);
    },
    [item.id, onDelete],
  );
  const handleRecalculate = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onRecalculate(item.id);
    },
    [item.id, onRecalculate],
  );

  return (
    <tr
      className="cursor-pointer hover:[&_td]:bg-accent/10 focus-visible:[&_td]:bg-accent/10"
      role="button"
      tabIndex={0}
      aria-label={`Открыть прогноз ${item.full_name}`}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      <td>{item.id}</td>
      <td>{item.full_name}</td>
      <td>{item.age}</td>
      <td>{item.predicted_cost.toFixed(2)} ₽</td>
      <td>
        {new Date(item.created_at).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="text-left">
        <KitButton
          type="button"
          style={{ padding: "0px" }}
          variant="icon"
          size={24}
          aria-label={`Перерасчет пациента ${item.full_name}`}
          onClick={handleRecalculate}
        >
          <img src={calculateIcon} alt="" aria-hidden="true" />
        </KitButton>
        <KitButton
          type="button"
          variant="icon"
          style={{ padding: "0px" }}
          size={24}
          aria-label={`Удалить прогноз ${item.full_name}`}
          onClick={handleDelete}
        >
          <img src={deleteIcon} alt="" aria-hidden="true" />
        </KitButton>
      </td>
    </tr>
  );
});

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
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="history-loading-card loading-card">
              <KitLoader label="Загрузка истории..." />
            </div>
          </div>
        )}
        <div className="scroll-transparent h-full min-h-0 overflow-auto">
          <table className="min-w-[890px]  duration-300 ease-in-out min-[1400px]:w-full">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[200px]" />
              <col className="w-[100px]" />
              <col className="w-[160px]" />
              <col className="w-[190px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="bg-transparent">
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
                </th>
                <th className="bg-transparent">
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
                </th>
                <th className="bg-transparent">
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
                </th>
                <th className="bg-transparent">
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
                </th>
                <th className="bg-transparent">
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
                </th>
                <th className="bg-transparent"></th>
              </tr>
            </thead>
            <tbody>
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
                <tr>
                  <td colSpan={6} className="py-4 text-center text-ui-sm text-muted">
                    Ничего не найдено по текущим фильтрам.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});

HistoryRow.displayName = "HistoryRow";
HistoryTableWidget.displayName = "HistoryTableWidget";
