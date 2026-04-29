import { useEffect, useMemo, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import type { HistoryItem } from "../../../shared/types/medcost";
import { ErrorAlert } from "../../../shared/ui/kit";
import { HistoryFiltersWidget } from "../../../widgets/history-filters/ui/HistoryFiltersWidget";
import { HistoryTableWidget } from "../../../widgets/history-table/ui/HistoryTableWidget";

type SortKey = "id" | "full_name" | "age" | "predicted_cost" | "created_at";
type SortOrder = "asc" | "desc";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const data = await medcostApi.history();
      setHistory(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: number) {
    await medcostApi.deleteHistory(id);
    await loadHistory();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortOrder("asc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  }

  const filteredAndSorted = useMemo(() => {
    const costMinNum = costMin ? Number(costMin) : null;
    const costMaxNum = costMax ? Number(costMax) : null;
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    const filtered = history.filter((row) => {
      const rowDate = new Date(row.created_at);
      const byCostMin = costMinNum === null || row.predicted_cost >= costMinNum;
      const byCostMax = costMaxNum === null || row.predicted_cost <= costMaxNum;
      const byDateFrom = !fromDate || rowDate >= fromDate;
      const byDateTo = !toDate || rowDate <= toDate;
      return byCostMin && byCostMax && byDateFrom && byDateTo;
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "full_name") cmp = a.full_name.localeCompare(b.full_name, "ru");
      if (sortKey === "id") cmp = a.id - b.id;
      if (sortKey === "age") cmp = a.age - b.age;
      if (sortKey === "predicted_cost") cmp = a.predicted_cost - b.predicted_cost;
      if (sortKey === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [history, costMin, costMax, dateFrom, dateTo, sortKey, sortOrder]);

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <section className="dashboard-main history-page-layout">
      {error && <ErrorAlert message={error} />}

      <HistoryFiltersWidget
        costMin={costMin}
        costMax={costMax}
        dateFrom={dateFrom}
        dateTo={dateTo}
        shownCount={filteredAndSorted.length}
        onCostMinChange={setCostMin}
        onCostMaxChange={setCostMax}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={() => {
          setCostMin("");
          setCostMax("");
          setDateFrom("");
          setDateTo("");
        }}
      />

      <HistoryTableWidget
        items={filteredAndSorted}
        loading={loading}
        onRefresh={loadHistory}
        onDelete={removeItem}
        onSort={toggleSort}
        sortIndicator={sortIndicator}
      />
    </section>
  );
}
