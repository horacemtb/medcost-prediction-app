import { useRef } from "react";
import { KitButton, KitInput } from "../../../shared/ui/kit";
import calendarIcon from "../../../shared/assets/calendar.svg";

type HistoryFiltersWidgetProps = {
  costMin: string;
  costMax: string;
  dateFrom: string;
  dateTo: string;
  shownCount: number;
  onCostMinChange: (value: string) => void;
  onCostMaxChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
};

export function HistoryFiltersWidget({
  costMin,
  costMax,
  dateFrom,
  dateTo,
  shownCount,
  onCostMinChange,
  onCostMaxChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: HistoryFiltersWidgetProps) {
  const hasFilters = Boolean(costMin || costMax || dateFrom || dateTo);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  function openDatePicker(input: HTMLInputElement | null) {
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  return (
    <section className="tile form-tile grid w-full max-w-[420px] gap-3 grid-cols-1">
      <h3 className="widget-title">Фильтры</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <KitInput type="number" placeholder="Прогноз от" value={costMin} onChange={(e) => onCostMinChange(e.target.value)} />
        <KitInput type="number" placeholder="Прогноз до" value={costMax} onChange={(e) => onCostMaxChange(e.target.value)} />
        <div className="relative">
          <KitInput
            ref={fromInputRef}
            type="date"
            className="pr-9"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 inline-grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md"
            aria-label="Открыть календарь: дата от"
            onClick={() => openDatePicker(fromInputRef.current)}
          >
            <img src={calendarIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative">
          <KitInput
            ref={toInputRef}
            type="date"
            className="pr-9"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 inline-grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md"
            aria-label="Открыть календарь: дата до"
            onClick={() => openDatePicker(toInputRef.current)}
          >
            <img src={calendarIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>Показано: {shownCount}</span>
        {hasFilters && (
          <KitButton type="button" onClick={onReset}>
            Сбросить фильтры
          </KitButton>
        )}
      </div>
    </section>
  );
}
