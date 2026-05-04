import { useCallback, useMemo, useState } from "react";
import type { HistoryItem } from "../../../shared/types/medcost";
import { parseHistoryDate } from "./history-utils";
import type { SortKey, SortOrder } from "./history-types";

export function useHistoryFiltersSort(history: HistoryItem[]) {
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      setSortOrder("asc");
    },
    [sortKey],
  );

  const sortIndicator = useCallback(
    (key: SortKey) => {
      if (sortKey !== key) return "↕";
      return sortOrder === "asc" ? "↑" : "↓";
    },
    [sortKey, sortOrder],
  );

  const resetFilters = useCallback(() => {
    setCostMin("");
    setCostMax("");
    setDateFrom("");
    setDateTo("");
  }, []);

  const filteredAndSorted = useMemo(() => {
    const costMinNum = costMin ? Number(costMin) : null;
    const costMaxNum = costMax ? Number(costMax) : null;
    const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    const filtered = history.filter((row) => {
      const rowTs = parseHistoryDate(row.created_at);
      const byCostMin = costMinNum === null || row.predicted_cost >= costMinNum;
      const byCostMax = costMaxNum === null || row.predicted_cost <= costMaxNum;
      const byDateFrom = fromTs === null || (!Number.isNaN(rowTs) && rowTs >= fromTs);
      const byDateTo = toTs === null || (!Number.isNaN(rowTs) && rowTs <= toTs);
      return byCostMin && byCostMax && byDateFrom && byDateTo;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "full_name") cmp = a.full_name.localeCompare(b.full_name, "ru");
      if (sortKey === "id") cmp = a.id - b.id;
      if (sortKey === "age") cmp = a.age - b.age;
      if (sortKey === "predicted_cost") cmp = a.predicted_cost - b.predicted_cost;
      if (sortKey === "created_at") {
        const aTs = parseHistoryDate(a.created_at);
        const bTs = parseHistoryDate(b.created_at);
        if (Number.isNaN(aTs) && Number.isNaN(bTs)) cmp = 0;
        else if (Number.isNaN(aTs)) cmp = 1;
        else if (Number.isNaN(bTs)) cmp = -1;
        else cmp = aTs - bTs;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [history, costMin, costMax, dateFrom, dateTo, sortKey, sortOrder]);

  return {
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
  };
}
