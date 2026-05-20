import type { ReactNode } from "react";

type MiniStatCardProps = {
  label: string;
  value: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function MiniStatCard({
  label,
  value,
  description,
  children,
  className = "",
}: MiniStatCardProps) {
  return (
    <article
      className={`tile h-min rounded-2xl border border-line/70 bg-white/5 p-4 ${className}`.trim()}
    >
      <p className="tiny text-ui-xs uppercase tracking-wide text-muted">{label}</p>
      <h3 className="m-0 mt-2 text-ui-lg font-semibold text-txt">{value}</h3>
      {description ? (
        <p className="m-0 text-ui-sm text-muted">{description}</p>
      ) : null}
      {children}
    </article>
  );
}
