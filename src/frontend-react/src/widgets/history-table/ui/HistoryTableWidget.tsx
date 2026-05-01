import { memo, useCallback, type MouseEvent } from "react";
import type { HistoryItem } from "../../../shared/types/medcost";
import { KitButton, KitLoader } from "../../../shared/ui/kit";
import { usePredictionDetailsModal } from "../../prediction-details-modal";
import deleteIcon from "../../../shared/assets/delete.svg";
import refreshIcon from "../../../shared/assets/refresh.svg";

type SortKey = "id" | "full_name" | "age" | "predicted_cost" | "created_at";

type HistoryTableWidgetProps = {
  items: HistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: number) => void;
  onSort: (key: SortKey) => void;
  sortIndicator: (key: SortKey) => string;
};

type HistoryRowProps = {
  item: HistoryItem;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
};

const HistoryRow = memo(function HistoryRow({ item, onOpen, onDelete }: HistoryRowProps) {
  const handleOpen = useCallback(() => onOpen(item.id), [item.id, onOpen]);
  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete(item.id);
    },
    [item.id, onDelete]
  );

  return (
    <tr
      className="history-row"
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
      <td>{new Date(item.created_at).toLocaleString()}</td>
      <td>
        <KitButton
          type="button"
          className="history-delete-btn"
          variant="icon"
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
  onDelete,
  onSort,
  sortIndicator,
}: HistoryTableWidgetProps) {
  const { openPredictionDetails } = usePredictionDetailsModal();
  const handleOpenPrediction = useCallback((id: number) => openPredictionDetails(id), [openPredictionDetails]);

  return (
    <section className="tile form-tile history-widget history-widget--table">
      <div className="history-meta history-meta--table">
        <h3 className="widget-title">Таблица истории</h3>
        <KitButton
          type="button"
          variant="icon"
          size={32}
          onClick={onRefresh}
          disabled={loading}
          aria-label={loading ? "Обновление..." : "Обновить"}
          title={loading ? "Обновление..." : "Обновить"}
        >
          <img
            src={refreshIcon}
            alt=""
            aria-hidden="true"
            className={loading ? "history-refresh-icon history-refresh-icon--loading" : "history-refresh-icon"}
          />
        </KitButton>
      </div>

      <div className="history-table-wrap">
        {loading && (
          <div className="history-loading-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="history-loading-card">
              <KitLoader label="Загрузка истории..." />
            </div>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" size={24} onClick={() => onSort("id")}>
                  Идентификатор {sortIndicator("id")}
                </KitButton>
              </th>
              <th>
                <KitButton
                  type="button"
                  className="sort-btn"
                  variant="sort"
                  size={24}
                  onClick={() => onSort("full_name")}
                >
                  ФИО {sortIndicator("full_name")}
                </KitButton>
              </th>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" size={24} onClick={() => onSort("age")}>
                  Возраст {sortIndicator("age")}
                </KitButton>
              </th>
              <th>
                <KitButton
                  type="button"
                  className="sort-btn"
                  variant="sort"
                  size={24}
                  onClick={() => onSort("predicted_cost")}
                >
                  Прогноз {sortIndicator("predicted_cost")}
                </KitButton>
              </th>
              <th>
                <KitButton
                  type="button"
                  className="sort-btn"
                  variant="sort"
                  size={24}
                  onClick={() => onSort("created_at")}
                >
                  Дата {sortIndicator("created_at")}
                </KitButton>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <HistoryRow key={item.id} item={item} onOpen={handleOpenPrediction} onDelete={onDelete} />
            ))}
            {!loading && !items.length && (
              <tr>
                <td colSpan={6} className="history-empty">
                  Ничего не найдено по текущим фильтрам.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
});

HistoryRow.displayName = "HistoryRow";
HistoryTableWidget.displayName = "HistoryTableWidget";
