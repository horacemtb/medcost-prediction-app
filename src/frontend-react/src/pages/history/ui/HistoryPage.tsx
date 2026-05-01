import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import { useMinimumLoading } from "../../../shared/lib/useMinimumLoading";
import type { HistoryItem } from "../../../shared/types/medcost";
import { ErrorAlert } from "../../../shared/ui/kit";
import { HistoryFiltersWidget } from "../../../widgets/history-filters/ui/HistoryFiltersWidget";
import { HistoryTableWidget } from "../../../widgets/history-table/ui/HistoryTableWidget";
import { PredictionDetailsWidget, usePredictionDetailsModal } from "../../../widgets/prediction-details-modal";

type SortKey = "id" | "full_name" | "age" | "predicted_cost" | "created_at";
type SortOrder = "asc" | "desc";
const DETAILS_PANEL_MAX_WIDTH = 420;
const DETAILS_PANEL_ANIMATION_MS = 280;

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
  const {
    open: detailsOpen,
    predictionId: activePredictionId,
    loading: detailsLoading,
    details: detailsData,
    error: detailsError,
    closePredictionDetails,
  } = usePredictionDetailsModal();
  const visibleLoading = useMinimumLoading(loading, { minMs: 1000 });
  const showDetailsWidget = detailsOpen || detailsLoading || Boolean(detailsData) || Boolean(detailsError);
  const [panelWidth, setPanelWidth] = useState(0);
  const [renderDetailsWidget, setRenderDetailsWidget] = useState(false);
  const rafRef = useRef<number | null>(null);
  const panelWidthRef = useRef(0);

  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  const loadHistory = useCallback(async () => {
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
  }, []);

  const removeItem = useCallback(
    async (id: number) => {
      await medcostApi.deleteHistory(id);
      if (activePredictionId === id) {
        closePredictionDetails();
      }
      await loadHistory();
    },
    [activePredictionId, closePredictionDetails, loadHistory]
  );

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      setSortOrder("asc");
    },
    [sortKey]
  );

  const sortIndicator = useCallback(
    (key: SortKey) => {
      if (sortKey !== key) return "↕";
      return sortOrder === "asc" ? "↑" : "↓";
    },
    [sortKey, sortOrder]
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
  }, [loadHistory]);

  useEffect(() => {
    const targetWidth = showDetailsWidget ? DETAILS_PANEL_MAX_WIDTH : 0;
    const startWidth = panelWidthRef.current;

    if (targetWidth === startWidth) {
      if (showDetailsWidget) {
        setRenderDetailsWidget(true);
      } else if (startWidth === 0) {
        setRenderDetailsWidget(false);
      }
      return;
    }

    if (showDetailsWidget) {
      setRenderDetailsWidget(true);
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const startedAt = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / DETAILS_PANEL_ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextWidth = Math.round(startWidth + (targetWidth - startWidth) * eased);
      setPanelWidth(nextWidth);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      rafRef.current = null;
      if (targetWidth === 0) {
        setRenderDetailsWidget(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [showDetailsWidget]);

  const historyLayoutStyle = useMemo(
    () =>
      ({
        "--history-details-width": `${panelWidth}px`,
      }) as CSSProperties,
    [panelWidth]
  );

  return (
    <section
      className={`dashboard-main history-page-layout ${renderDetailsWidget ? "history-page-layout--with-details" : ""}`.trim()}
      style={historyLayoutStyle}
    >
      <div className="history-main-column">
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
          onReset={resetFilters}
        />

        <div className="history-content-layout">
          <HistoryTableWidget
            items={filteredAndSorted}
            loading={visibleLoading}
            onRefresh={loadHistory}
            onDelete={removeItem}
            onSort={toggleSort}
            sortIndicator={sortIndicator}
          />
        </div>
      </div>
      {renderDetailsWidget && <PredictionDetailsWidget />}
    </section>
  );
}
