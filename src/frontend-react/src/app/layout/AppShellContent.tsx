import type { ReactNode } from "react";

type AppShellContentProps = {
  sidebarCollapsed: boolean;
  children: ReactNode;
};

export function AppShellContent({
  sidebarCollapsed,
  children,
}: AppShellContentProps) {
  return (
    <div
      className={[
        "relative z-10 min-w-0 border-l border-[#e8ecf4] bg-[#f6f8fd] transition-[margin-left,width] duration-300 ease-in-out",
        sidebarCollapsed ? "md:-ml-[196px] md:w-[calc(100%+196px)]" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
