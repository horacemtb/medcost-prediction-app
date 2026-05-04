import { useEffect, useRef, useState } from "react";
import { KitButton } from "../../../shared/ui/kit";
import type { PredictionDetailsResponse } from "../../../shared/types/medcost";
import calculateIcon from "../../../shared/assets/calculate.svg";
import deleteIcon from "../../../shared/assets/delete.svg";
import downloadIcon from "../../../shared/assets/download.svg";
import moreIcon from "../../../shared/assets/more.svg";

type PredictionDetailsActionsDropdownProps = {
  details: PredictionDetailsResponse;
  onRecalculate?: (details: PredictionDetailsResponse) => void;
  onDelete?: (details: PredictionDetailsResponse) => void;
  onExport?: (details: PredictionDetailsResponse) => void;
};

export function PredictionDetailsActionsDropdown({
  details,
  onRecalculate,
  onDelete,
  onExport,
}: PredictionDetailsActionsDropdownProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!actionsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [actionsOpen]);

  return (
    <div className="relative" ref={actionsRef}>
      <KitButton
        type="button"
        variant="icon"
        onClick={() => setActionsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={actionsOpen}
        aria-label="Открыть действия"
      >
        <img src={moreIcon} alt="" aria-hidden="true" />
      </KitButton>

      {actionsOpen && (
        <div
          className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-xl border p-1.5 shadow-2xl backdrop-blur [border-color:color-mix(in_srgb,var(--line)_80%,transparent)] [background:color-mix(in_srgb,var(--bg)_94%,#fff_6%)]"
          role="menu"
        >
          <KitButton
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onRecalculate?.(details);
              setActionsOpen(false);
            }}
          >
            <img src={calculateIcon} alt="" aria-hidden="true" />
            Перерасчет
          </KitButton>
          <KitButton
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onExport?.(details);
              setActionsOpen(false);
            }}
          >
            <img src={downloadIcon} alt="" aria-hidden="true" />
            Экспорт
          </KitButton>
          <KitButton
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              onDelete?.(details);
              setActionsOpen(false);
            }}
          >
            <img src={deleteIcon} alt="" aria-hidden="true" />
            Удалить
          </KitButton>
        </div>
      )}
    </div>
  );
}
