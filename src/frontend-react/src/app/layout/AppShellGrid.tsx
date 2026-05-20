import type { CSSProperties, ReactNode } from "react";

type AppShellGridProps = {
  children: ReactNode;
};

const shellStyle = {
  "--sidebar-width": "292px",
} as CSSProperties;

export function AppShellGrid({ children }: AppShellGridProps) {
  return (
    <div
      className="grid min-h-screen w-full grid-cols-1 gap-0 overflow-x-hidden transition-[grid-template-columns] duration-300 ease-in-out md:[grid-template-columns:var(--sidebar-width)_minmax(0,1fr)]"
      style={shellStyle}
    >
      {children}
    </div>
  );
}
