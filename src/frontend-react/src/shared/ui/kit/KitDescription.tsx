import type { ReactNode } from "react";

type KitDescriptionProps = {
  children: ReactNode;
  className?: string;
};

export function KitDescription({ children, className = "" }: KitDescriptionProps) {
  return <p className={`m-0 text-xs text-muted ${className}`.trim()}>{children}</p>;
}

