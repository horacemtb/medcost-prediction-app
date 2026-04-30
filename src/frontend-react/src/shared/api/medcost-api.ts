import type { HistoryResponse, PredictionDetailsResponse, PredictionInput, PredictionResponse, RiskFactor } from "../types/medcost";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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

export const medcostApi = {
  health: () => req<{ status: string }>("/api/health"),
  predict: (payload: PredictionInput) =>
    req<PredictionResponse>("/api/predict", { method: "POST", body: JSON.stringify(payload) }),
  prediction: (id: number, init?: RequestInit) => req<PredictionDetailsResponse>(`/api/predictions/${id}`, init),
  factors: (id: number) => req<RiskFactor[]>(`/api/predictions/${id}/factors`),
  history: (search?: string) => req<HistoryResponse>(`/api/history${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  deleteHistory: (id: number) => req<{ message: string }>(`/api/history/${id}`, { method: "DELETE" }),
};
