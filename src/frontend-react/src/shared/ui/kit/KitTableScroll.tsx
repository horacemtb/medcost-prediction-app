import type { HTMLAttributes, ReactNode } from "react";

type KitTableScrollProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function KitTableScroll({
  children,
  className = "",
  ...props
}: KitTableScrollProps) {
  return (
    <div
      className={`scroll-transparent min-h-0 overflow-auto ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
