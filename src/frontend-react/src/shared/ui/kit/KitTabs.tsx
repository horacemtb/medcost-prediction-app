import type { ReactNode } from "react";
import { KitButton } from "./KitButton";

export type KitTabItem<T extends string> = {
  id: T;
  label: ReactNode;
};

type KitTabsProps<T extends string> = {
  items: readonly KitTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
  tabClassName?: string;
};

export function KitTabs<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel,
  className = "",
  tabClassName = "",
}: KitTabsProps<T>) {
  return (
    <div className={`kit-tabs flex flex-wrap gap-2 ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <KitButton
            key={item.id}
            role="tab"
            type="button"
            variant="tab"
            aria-selected={isActive}
            className={`kit-tabs__tab ${isActive ? "active" : ""} ${tabClassName}`.trim()}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </KitButton>
        );
      })}
    </div>
  );
}

