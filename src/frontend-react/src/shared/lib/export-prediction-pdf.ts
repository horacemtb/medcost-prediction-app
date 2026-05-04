import type { PredictionDetailsResponse, PredictionResponse } from "../types/medcost";

type ExportablePrediction =
  | PredictionDetailsResponse
  | (PredictionResponse & { previous_year_cost?: number });

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

export function exportPredictionPdf(data: ExportablePrediction) {
  const previousYearCost = "previous_year_cost" in data ? data.previous_year_cost : undefined;
  const lines = [
    "Карта прогноза медицинских расходов",
    "",
    `ФИО: ${data.full_name}`,
    `ID прогноза: ${data.prediction_id}`,
    `Прогноз расходов: ${data.predicted_cost.toLocaleString("ru-RU")}`,
    previousYearCost !== undefined
      ? `Расходы за прошлый год: ${previousYearCost.toLocaleString("ru-RU")}`
      : null,
    `Дата расчета: ${formatDate(data.created_at)}`,
  ].filter(Boolean);

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Прогноз расходов</title>
<style>
  body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
  h1 { margin: 0 0 16px; font-size: 20px; }
  p { margin: 8px 0; font-size: 14px; }
</style>
</head>
<body>
  <h1>${lines[0]}</h1>
  ${lines.slice(2).map((line) => `<p>${line}</p>`).join("\n")}
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
