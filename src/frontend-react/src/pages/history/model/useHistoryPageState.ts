import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { medcostApi } from "../../../shared/api/medcost-api";
import { usePredictionDetails } from "../../../widgets/prediction-details";
import { useHistoryData } from "./useHistoryData";
import { useHistoryFiltersSort } from "./useHistoryFiltersSort";

export function useHistoryPageState() {
  const navigate = useNavigate();
  const location = useLocation();
  const { predictionId: activePredictionId, closePredictionDetails } =
    usePredictionDetails();

  const searchQuery = new URLSearchParams(location.search).get("search")?.trim() ?? "";

  const { history, error, visibleLoading, loadHistory, removeItem } = useHistoryData({
    activePredictionId,
    closePredictionDetails,
  });

  const {
    costMin,
    costMax,
    dateFrom,
    dateTo,
    setCostMin,
    setCostMax,
    setDateFrom,
    setDateTo,
    resetFilters,
    filteredAndSorted,
    toggleSort,
    sortIndicator,
  } = useHistoryFiltersSort(history, {
    initialSortKey: searchQuery ? "full_name" : "created_at",
    initialSortOrder: searchQuery ? "asc" : "desc",
  });

  useEffect(() => {
    void loadHistory(searchQuery || undefined);
  }, [loadHistory, searchQuery]);

  const handleOpenFromTable = useCallback(
    async (id: number) => {
      const details = await medcostApi.prediction(id);
      navigate("/predict", { state: { prefillDetails: details, openReport: true } });
    },
    [navigate],
  );

  const handleRecalculateFromTable = useCallback(
    async (id: number) => {
      const details = await medcostApi.prediction(id);
      navigate("/predict", { state: { prefillDetails: details } });
    },
    [navigate],
  );

  return {
    costMin,
    costMax,
    dateFrom,
    dateTo,
    error,
    filteredAndSorted,
    visibleLoading,
    resetFilters,
    sortIndicator,
    toggleSort,
    setCostMin,
    setCostMax,
    setDateFrom,
    setDateTo,
    loadHistory,
    removeItem: (id: number) => removeItem(id, searchQuery || undefined),
    handleOpenFromTable,
    handleRecalculateFromTable,
  };
}
