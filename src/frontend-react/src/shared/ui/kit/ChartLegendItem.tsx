import type { ReactNode } from "react";

type ChartLegendItemProps = {
  label: ReactNode;
  value: ReactNode;
  color: string;
  className?: string;
};

export function ChartLegendItem({
  label,
  value,
  color,
  className = "",
}: ChartLegendItemProps) {
  return (
    <article className={`rounded-xl border border-line/70 bg-white p-3 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-ui-sm font-semibold text-txt">{label}</p>
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="m-0 text-ui-sm text-muted">{value}</p>
    </article>
  );
}
