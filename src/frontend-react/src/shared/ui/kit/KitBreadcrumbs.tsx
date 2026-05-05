import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  to?: string;
  onClick?: () => void;
};

type KitBreadcrumbsProps = {
  items: BreadcrumbItem[];
  activeIndex?: number;
  className?: string;
};

export function KitBreadcrumbs({
  items,
  activeIndex,
  className = "",
}: KitBreadcrumbsProps) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className={`inline-flex h-fit w-fit self-start items-center gap-1 text-ui-sm text-[#72809a] ${className}`.trim()}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive =
          typeof activeIndex === "number" ? activeIndex === index : isLast;
        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-1"
          >
            {item.to && !isActive ? (
              <Link
                to={item.to}
                className="transition hover:text-[#2f64ef]"
                onClick={item?.onClick}
              >
                {item.label}
              </Link>
            ) : (
              <span className={isActive ? "font-semibold text-[#1b2741]" : ""}>
                {item.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRight className="size-4 text-[#9aa5bb]" />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
