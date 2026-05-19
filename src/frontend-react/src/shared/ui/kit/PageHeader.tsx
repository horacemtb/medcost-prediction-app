import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  sticky?: boolean;
  titleAs?: "h1" | "h2" | "h3";
};

export function PageHeader({
  title,
  description,
  actions,
  className = "",
  sticky = false,
  titleAs = "h1",
}: PageHeaderProps) {
  const Title = titleAs;
  const rootClassName = [
    sticky ? "sticky top-0 z-20 -mx-2 bg-[#f6f8fd] px-2 pb-1 pt-1" : "",
    "flex flex-wrap items-start justify-between gap-3",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="space-y-2">
        <Title className="m-0 text-ui-display text-[#13264b]">{title}</Title>
        {description ? (
          <p className="m-0 max-w-3xl text-ui-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
