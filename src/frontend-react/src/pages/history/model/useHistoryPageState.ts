import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { medcostApi } from "../../../shared/api/medcost-api";
import { exportPredictionPdf } from "../../../shared/lib/export-prediction-pdf";
import type { PredictionDetailsResponse } from "../../../shared/types/medcost";
import { usePredictionDetails } from "../../../widgets/prediction-details";
import { useHistoryData } from "./useHistoryData";
import { useHistoryFiltersSort } from "./useHistoryFiltersSort";

export function useHistoryPageState() {
  const navigate = useNavigate();
  const {
    open: detailsOpen,
    predictionId: activePredictionId,
    loading: detailsLoading,
    details: detailsData,
    error: detailsError,
    closePredictionDetails,
  } = usePredictionDetails();

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
  } = useHistoryFiltersSort(history);

  const showDetailsWidget =
    detailsOpen || detailsLoading || Boolean(detailsData) || Boolean(detailsError);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleRecalculateFromDetails = useCallback(() => {
    if (!detailsData) return;
    navigate("/predict", { state: { prefillDetails: detailsData } });
  }, [detailsData, navigate]);

  const handleRecalculateFromTable = useCallback(
    async (id: number) => {
      const details = await medcostApi.prediction(id);
      navigate("/predict", { state: { prefillDetails: details } });
    },
    [navigate],
  );

  const handleExportFromDetails = useCallback(
    (details: PredictionDetailsResponse) => {
      exportPredictionPdf(details);
    },
    [],
  );

  const handleDeleteFromDetails = useCallback(
    async (details: PredictionDetailsResponse) => {
      await removeItem(details.prediction_id);
    },
    [removeItem],
  );

  return {
    costMin,
    costMax,
    dateFrom,
    dateTo,
    error,
    filteredAndSorted,
    visibleLoading,
    showDetailsWidget,
    renderDetailsWidget: showDetailsWidget,
    resetFilters,
    sortIndicator,
    toggleSort,
    setCostMin,
    setCostMax,
    setDateFrom,
    setDateTo,
    loadHistory,
    removeItem,
    handleRecalculateFromTable,
    handleRecalculateFromDetails,
    handleExportFromDetails,
    handleDeleteFromDetails,
  };
}
