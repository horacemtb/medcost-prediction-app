import { useCallback, useEffect, useState } from "react";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

export function useSidebarCollapsed() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      sidebarCollapsed ? "1" : "0",
    );
  }, [sidebarCollapsed]);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((value) => !value);
  }, []);

  return {
    sidebarCollapsed,
    toggleSidebarCollapsed,
  };
}
