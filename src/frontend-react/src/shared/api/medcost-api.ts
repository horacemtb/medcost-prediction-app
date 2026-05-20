import type {
  HistoryResponse,
  OcrPatientFormResponse,
  PredictionAssessmentResponse,
  PredictionDetailsResponse,
  PredictionInput,
  PredictionResponse,
  RiskFactor,
} from "../types/medcost";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }

  return res.json() as Promise<T>;
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }

  return res.json() as Promise<T>;
}

async function reqBlob(path: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${body}`);
  }

  return res.blob();
}

export type DadataSuggestion = {
  value: string;
  data?: Record<string, unknown>;
};

export const medcostApi = {
  health: () => req<{ status: string }>("/api/health"),
  predict: (payload: PredictionInput) =>
    req<PredictionResponse>("/api/predict", { method: "POST", body: JSON.stringify(payload) }),
  recalculatePrediction: (id: number, payload: PredictionInput) =>
    req<PredictionResponse>(`/api/predictions/${id}/recalculate`, { method: "PUT", body: JSON.stringify(payload) }),
  prediction: (id: number, init?: RequestInit) => req<PredictionDetailsResponse>(`/api/predictions/${id}`, init),
  assessment: (id: number) => req<PredictionAssessmentResponse>(`/api/predictions/${id}/assessment`),
  factors: (id: number) => req<RiskFactor[]>(`/api/predictions/${id}/factors`),
  history: (search?: string) => req<HistoryResponse>(`/api/history${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  deleteHistory: (id: number) => req<{ message: string }>(`/api/history/${id}`, { method: "DELETE" }),
  ocrPatientForm: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return upload<OcrPatientFormResponse>("/api/ocr/patient-form", formData);
  },
  percentile: (predicted_cost: number) =>
    req<{ percentile: number }>("/api/percentile", {
      method: "POST",
      body: JSON.stringify({ predicted_cost }),
    }),
  exportPredictionPdf: (id: number) => reqBlob(`/api/predictions/${id}/pdf`),
  suggestAddress: (query: string, count = 5) =>
    req<{ suggestions: DadataSuggestion[] }>(`/api/dadata/suggestions?query=${encodeURIComponent(query)}&count=${count}`),
};
