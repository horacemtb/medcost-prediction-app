import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import type { PredictionDetailsResponse } from "../../../shared/types/medcost";

type PredictionDetailsModalState = {
  open: boolean;
  predictionId: number | null;
  details: PredictionDetailsResponse | null;
  loading: boolean;
  error: string;
};

type PredictionDetailsModalContextValue = PredictionDetailsModalState & {
  openPredictionDetails: (id: number) => void;
  closePredictionDetails: () => void;
  retryPredictionDetails: () => void;
};

const PredictionDetailsModalContext =
  createContext<PredictionDetailsModalContextValue | null>(null);

export function PredictionDetailsModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [predictionId, setPredictionId] = useState<number | null>(null);
  const [details, setDetails] = useState<PredictionDetailsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestToken, setRequestToken] = useState(0);

  const closePredictionDetails = useCallback(() => {
    setOpen(false);
    setPredictionId(null);
    setDetails(null);
    setLoading(false);
    setError("");
  }, []);

  const openPredictionDetails = useCallback((id: number) => {
    if (id === predictionId) return;
    setPredictionId(id);
    setOpen(true);
    setError("");
    setRequestToken((token) => token + 1);
  }, [predictionId]);

  const retryPredictionDetails = useCallback(() => {
    if (predictionId === null) return;
    setError("");
    setRequestToken((token) => token + 1);
  }, [predictionId]);

  useEffect(() => {
    if (!open || predictionId === null) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    medcostApi
      .prediction(predictionId, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) {
          setDetails(response);
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Ошибка");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [open, predictionId, requestToken]);

  const value = useMemo(
    () => ({
      open,
      predictionId,
      details,
      loading,
      error,
      openPredictionDetails,
      closePredictionDetails,
      retryPredictionDetails,
    }),
    [
      closePredictionDetails,
      details,
      error,
      loading,
      open,
      openPredictionDetails,
      predictionId,
      retryPredictionDetails,
    ],
  );

  return (
    <PredictionDetailsModalContext.Provider value={value}>
      {children}
    </PredictionDetailsModalContext.Provider>
  );
}

export function usePredictionDetailsModal() {
  const value = useContext(PredictionDetailsModalContext);

  if (!value) {
    throw new Error(
      "usePredictionDetailsModal must be used within PredictionDetailsModalProvider",
    );
  }

  return value;
}
