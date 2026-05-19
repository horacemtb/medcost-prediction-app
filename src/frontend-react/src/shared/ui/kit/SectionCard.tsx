import type { ElementType, ReactNode } from "react";
import { Panel, PanelHeader } from "./Panel";

type SectionCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ElementType<{ className?: string }>;
  children: ReactNode;
  className?: string;
  density?: "md" | "lg";
};

export function SectionCard({
  title,
  description,
  icon,
  children,
  className = "",
  density = "md",
}: SectionCardProps) {
  const Icon = icon;

  return (
    <Panel as="article" density={density} className={className}>
      <PanelHeader
        title={title}
        icon={Icon ? <Icon className="size-5 text-[#2f64ef]" /> : null}
        titleAs="h4"
        className={description ? "mb-2" : "mb-3"}
      />
      {description ? (
        <p className="m-0 mb-3 text-ui-xs text-[#5f6e86]">{description}</p>
      ) : null}
      {children}
    </Panel>
  );
}
