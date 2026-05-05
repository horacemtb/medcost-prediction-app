import type { ReactNode } from "react";

type KitFieldLabelProps = {
  children: ReactNode;
  className?: string;
};

export function KitFieldLabel({ children, className = "" }: KitFieldLabelProps) {
  return <span className={`mb-1 block text-ui-sm text-muted ${className}`.trim()}>{children}</span>;
}

