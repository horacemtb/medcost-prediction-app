import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { medcostApi } from "../../../shared/api/medcost-api";

export function GlobalPatientSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState("");

  const handleGlobalSearch = useCallback(async () => {
    const query = globalSearch.trim();
    if (!query) return;

    if (/^\d+$/.test(query)) {
      try {
        const id = Number(query);
        const details = await medcostApi.prediction(id);
        navigate("/predict", {
          state: { prefillDetails: details, openReport: true },
        });
      } catch {
        navigate(`/history?search=${encodeURIComponent(query)}`);
      }
      return;
    }

    navigate(`/history?search=${encodeURIComponent(query)}`);
  }, [globalSearch, navigate]);

  const handleClearSearch = useCallback(() => {
    setGlobalSearch("");

    if (location.pathname.startsWith("/history")) {
      navigate("/history");
      return;
    }

    if (location.pathname.startsWith("/predict")) {
      navigate("/predict", { state: { forceNew: true } });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-11 w-full max-w-[680px] items-center rounded-2xl bg-[#f1f4fa] px-4">
      <Search className="mr-3 size-5 text-[#74839b]" />
      <input
        className="w-full bg-transparent text-ui-sm text-[#30425f] outline-none placeholder:text-[#74839b]"
        placeholder="Поиск по имени или ID пациента"
        value={globalSearch}
        onChange={(event) => setGlobalSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            void handleGlobalSearch();
          }
        }}
      />
      {globalSearch.trim() ? (
        <button
          type="button"
          className="ml-2 inline-flex size-7 items-center justify-center rounded-full text-[#74839b] transition hover:bg-[#e5ebf5] hover:text-[#30425f]"
          onClick={handleClearSearch}
          aria-label="Очистить поиск"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
