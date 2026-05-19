import type { HTMLAttributes, ReactNode } from "react";

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ScrollArea({ children, className = "", ...props }: ScrollAreaProps) {
  return (
    <div
      className={`scroll-transparent min-h-0 overflow-auto pr-1 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
