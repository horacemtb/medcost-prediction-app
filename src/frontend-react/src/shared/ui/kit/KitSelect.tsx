import type { SelectHTMLAttributes } from "react";

type KitSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function KitSelect({ className = "", children, ...props }: KitSelectProps) {
  return (
    <select
      className={`h-8 w-full rounded-xl border border-line/70 bg-transparent px-3 text-[14px] text-txt outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/25 ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
}
