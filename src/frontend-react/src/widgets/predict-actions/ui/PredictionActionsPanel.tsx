import addChartIcon from "../../../shared/assets/addChart.svg";
import calculateIcon from "../../../shared/assets/calculate.svg";
import deleteIcon from "../../../shared/assets/delete.svg";
import downloadIcon from "../../../shared/assets/download.svg";
import { exportPredictionPdf } from "../../../shared/lib/export-prediction-pdf";
import type { PredictionResponse } from "../../../shared/types/medcost";
import { KitButton, KitDescription, KitWidgetTitle } from "../../../shared/ui/kit";

type PredictionActionsPanelProps = {
  result: PredictionResponse;
  previousYearCost: number;
  busy: boolean;
  onCreateNew: () => void;
  onRecalculate: () => void;
  onDelete: () => void;
};

export function PredictionActionsPanel({
  result,
  previousYearCost,
  busy,
  onCreateNew,
  onRecalculate,
  onDelete,
}: PredictionActionsPanelProps) {
  function handleExportPdf() {
    exportPredictionPdf({
      prediction_id: result.prediction_id,
      full_name: result.full_name,
      predicted_cost: result.predicted_cost,
      previous_year_cost: previousYearCost,
      created_at: result.created_at,
    });
  }

  return (
    <div className="grid h-fit gap-2 grid-cols-1">
      <section className="tile form-tile grid gap-2 grid-cols-1">
        <KitWidgetTitle>Экспорт в PDF</KitWidgetTitle>
        <KitDescription>
          Сформировать печатную PDF-версию карты прогноза по текущему расчету.
        </KitDescription>
        <KitButton type="button" variant="primary" onClick={handleExportPdf}>
          <img src={downloadIcon} alt="Экспорт" />
          Экспортировать в PDF
        </KitButton>
      </section>

      <section className="tile form-tile grid gap-2 grid-cols-1">
        <KitWidgetTitle>Новый расчет</KitWidgetTitle>
        <KitDescription>
          Создать новый расчет и очистить текущие результаты.
        </KitDescription>
        <KitButton type="button" onClick={onCreateNew} disabled={busy}>
          <img src={addChartIcon} alt="Новый расчет" />
          Новый расчет
        </KitButton>
      </section>

      <section className="tile form-tile grid gap-2 grid-cols-1">
        <KitWidgetTitle>Перерасчет</KitWidgetTitle>
        <KitDescription>
          Выполнить перерасчет для текущего пациента.
        </KitDescription>
        <KitButton
          type="button"
          variant="primary"
          onClick={onRecalculate}
          disabled={busy}
        >
          <img src={calculateIcon} alt="Перерассчитать" />
          Перерассчитать
        </KitButton>
      </section>

      <section className="tile form-tile grid gap-2 grid-cols-1">
        <KitWidgetTitle>Удаление</KitWidgetTitle>
        <KitDescription>
          Удалить текущий прогноз из базы данных.
        </KitDescription>
        <KitButton
          type="button"
          variant="danger"
          onClick={onDelete}
          disabled={busy}
        >
          <img src={deleteIcon} alt="Удалить" />
          Удалить
        </KitButton>
      </section>
    </div>
  );
}
