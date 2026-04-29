import { KitButton, KitInput } from "../../../shared/ui/kit";

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
  return (
    <section className="tile form-tile history-widget history-widget--filters">
      <h3 className="widget-title">Фильтры</h3>
      <div className="history-filters">
        <KitInput type="number" placeholder="Прогноз от" value={costMin} onChange={(e) => onCostMinChange(e.target.value)} />
        <KitInput type="number" placeholder="Прогноз до" value={costMax} onChange={(e) => onCostMaxChange(e.target.value)} />
        <KitInput type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
        <KitInput type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
      </div>
      <div className="history-meta history-meta--filters">
        <span>Показано: {shownCount}</span>
        <KitButton type="button" onClick={onReset}>
          Сбросить фильтры
        </KitButton>
      </div>
    </section>
  );
}
