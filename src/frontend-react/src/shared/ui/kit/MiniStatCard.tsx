import type { ReactNode } from "react";

type MiniStatCardProps = {
  label: string;
  value: ReactNode;
};

export function MiniStatCard({ label, value }: MiniStatCardProps) {
  return (
    <article className="tile rounded-2xl border border-line/70 bg-white/5 p-4 h-min">
      <p className="tiny text-xs uppercase tracking-wide text-muted">{label}</p>
      <h3 className="mt-2 text-xl font-semibold text-txt">{value}</h3>
    </article>
  );
}
