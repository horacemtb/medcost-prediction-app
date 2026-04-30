import type { HistoryItem } from "../../../shared/types/medcost";
import { KitButton } from "../../../shared/ui/kit";
import { usePredictionDetailsModal } from "../../prediction-details-modal";
import deleteIcon from "../../../shared/assets/delete.svg";

type SortKey = "id" | "full_name" | "age" | "predicted_cost" | "created_at";

type HistoryTableWidgetProps = {
  items: HistoryItem[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: number) => void;
  onSort: (key: SortKey) => void;
  sortIndicator: (key: SortKey) => string;
};

export function HistoryTableWidget({
  items,
  loading,
  onRefresh,
  onDelete,
  onSort,
  sortIndicator,
}: HistoryTableWidgetProps) {
  const { openPredictionDetails } = usePredictionDetailsModal();

  return (
    <section className="tile form-tile history-widget history-widget--table">
      <div className="history-meta history-meta--table">
        <h3 className="widget-title">Таблица истории</h3>
        <KitButton type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Загрузка..." : "Обновить"}
        </KitButton>
      </div>

      <div className="history-table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" onClick={() => onSort("id")}>
                  Идентификатор {sortIndicator("id")}
                </KitButton>
              </th>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" onClick={() => onSort("full_name")}>
                  ФИО {sortIndicator("full_name")}
                </KitButton>
              </th>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" onClick={() => onSort("age")}>
                  Возраст {sortIndicator("age")}
                </KitButton>
              </th>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" onClick={() => onSort("predicted_cost")}>
                  Прогноз {sortIndicator("predicted_cost")}
                </KitButton>
              </th>
              <th>
                <KitButton type="button" className="sort-btn" variant="sort" onClick={() => onSort("created_at")}>
                  Дата {sortIndicator("created_at")}
                </KitButton>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((h) => (
              <tr
                key={h.id}
                className="history-row"
                role="button"
                tabIndex={0}
                aria-label={`Открыть прогноз ${h.full_name}`}
                onClick={() => openPredictionDetails(h.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPredictionDetails(h.id);
                  }
                }}
              >
                <td>{h.id}</td>
                <td>{h.full_name}</td>
                <td>{h.age}</td>
                <td>{h.predicted_cost.toFixed(2)} ₽</td>
                <td>{new Date(h.created_at).toLocaleString()}</td>
                <td>
                  <KitButton
                    type="button"
                    className="danger"
                    variant="danger"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(h.id);
                    }}
                  >
                    <img src={deleteIcon} alt="" aria-hidden="true" />
                  </KitButton>
                </td>
              </tr>
            ))}
            {!items.length && (
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
}
