import type { ReactNode } from "react";
import { InfoTooltip } from "./InfoTooltip";
import { Panel, PanelHeader } from "./Panel";

type WidgetCardProps = {
  title?: ReactNode;
  tooltipLabel?: string;
  tooltip?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WidgetCard({
  title,
  tooltipLabel,
  tooltip,
  children,
  className = "",
}: WidgetCardProps) {
  return (
    <Panel className={className}>
      {title ? (
        <PanelHeader
          title={title}
          action={
            tooltip && tooltipLabel ? (
            <InfoTooltip label={tooltipLabel}>{tooltip}</InfoTooltip>
            ) : null
          }
        />
      ) : null}
      {children}
    </Panel>
  );
}
