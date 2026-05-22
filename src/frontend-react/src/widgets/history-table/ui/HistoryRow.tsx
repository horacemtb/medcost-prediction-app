import { memo, useCallback, type MouseEvent } from "react";
import type { HistoryItem } from "../../../shared/types/medcost";
import { KitButton, KitTableCell, KitTableRow } from "../../../shared/ui/kit";
import calculateIcon from "../../../shared/assets/calculate.svg";
import deleteIcon from "../../../shared/assets/delete.svg";

type HistoryRowProps = {
  item: HistoryItem;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  onRecalculate: (id: number) => void;
};

export const HistoryRow = memo(function HistoryRow({
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
    <KitTableRow
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
      <KitTableCell>{item.id}</KitTableCell>
      <KitTableCell>{item.full_name}</KitTableCell>
      <KitTableCell>{item.snils || "-"}</KitTableCell>
      <KitTableCell>{item.age}</KitTableCell>
      <KitTableCell>{item.predicted_cost.toFixed(2)} ₽</KitTableCell>
      <KitTableCell>
        {new Date(item.created_at).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </KitTableCell>
      <KitTableCell className="text-left">
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
      </KitTableCell>
    </KitTableRow>
  );
});
