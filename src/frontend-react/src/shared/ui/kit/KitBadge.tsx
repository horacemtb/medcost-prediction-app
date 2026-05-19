import type { ReactNode } from "react";

type KitBadgeProps = {
  children: ReactNode;
  className?: string;
};

export function KitBadge({ children, className = "" }: KitBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-ui-xs font-semibold ${className}`.trim()}
    >
      {children}
    </span>
  );
}
