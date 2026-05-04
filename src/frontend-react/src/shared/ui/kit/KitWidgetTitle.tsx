import type { ReactNode } from "react";

type KitWidgetTitleProps = {
  children: ReactNode;
  className?: string;
};

export function KitWidgetTitle({ children, className = "" }: KitWidgetTitleProps) {
  return <h3 className={`widget-title ${className}`.trim()}>{children}</h3>;
}

