import type { ElementType, ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  borderClassName?: string;
  surfaceClassName?: string;
  as?: ElementType;
  density?: "md" | "lg";
};

type PanelHeaderProps = {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  titleAs?: ElementType;
  className?: string;
};

export function Panel({
  children,
  className = "",
  borderClassName = "border-line/70",
  surfaceClassName = "bg-white/70",
  as: Component = "section",
  density = "lg",
}: PanelProps) {
  const padding = density === "md" ? "p-4" : "p-5";
  const radius = density === "md" ? "rounded-2xl" : "rounded-3xl";

  return (
    <Component
      className={`tile ${radius} border ${borderClassName} ${surfaceClassName} ${padding} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

export function PanelHeader({
  title,
  icon,
  action,
  titleAs: Title = "h2",
  className = "",
}: PanelHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <Title className="widget-title inline-flex items-center gap-2">
        {icon}
        {title}
      </Title>
      {action}
    </div>
  );
}
