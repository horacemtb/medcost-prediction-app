import { useCallback, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import type { HistoryItem } from "../../../shared/types/medcost";

type UseHistoryDataParams = {
  activePredictionId: number | null;
  closePredictionDetails: () => void;
};

export function useHistoryData({
  activePredictionId,
  closePredictionDetails,
}: UseHistoryDataParams) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });

  const loadHistory = useCallback(async (search?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await medcostApi.history(search);
      setHistory(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(
    async (id: number, search?: string) => {
      await medcostApi.deleteHistory(id);
      if (activePredictionId === id) {
        closePredictionDetails();
      }
      await loadHistory(search);
    },
    [activePredictionId, closePredictionDetails, loadHistory],
  );

  return {
    history,
    error,
    visibleLoading,
    loadHistory,
    removeItem,
  };
}
