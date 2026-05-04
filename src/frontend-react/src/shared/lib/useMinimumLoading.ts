import { useEffect, useRef, useState } from "react";

export function useMinimumLoading(
  loading: boolean,
  options?: { minMs?: number },
) {
  const minMs = options?.minMs ?? 0;
  const [visible, setVisible] = useState(loading);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (loading) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    const startedAt = startedAtRef.current;
    if (!startedAt) {
      setVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remain = Math.max(0, minMs - elapsed);

    if (remain === 0) {
      setVisible(false);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, remain);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, minMs]);

  return visible;
}
