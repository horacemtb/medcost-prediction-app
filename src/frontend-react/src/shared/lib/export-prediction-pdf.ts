import { medcostApi } from "../api/medcost-api";
import type {
  PredictionDetailsResponse,
  PredictionResponse,
} from "../types/medcost";

type ExportablePrediction =
  | PredictionDetailsResponse
  | (PredictionResponse & { previous_year_cost?: number });

export async function exportPredictionPdf(data: ExportablePrediction) {
  const blob = await medcostApi.exportPredictionPdf(data.prediction_id);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `prediction-report-${data.prediction_id}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
