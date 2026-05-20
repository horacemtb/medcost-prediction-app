import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

type InfoTooltipProps = {
  label: string;
  children: ReactNode;
  size?: "sm" | "md";
};

export function InfoTooltip({ label, children, size = "md" }: InfoTooltipProps) {
  const iconClassName = size === "sm" ? "size-3.5" : "size-4";
  const buttonClassName =
    size === "sm"
      ? "group relative inline-grid h-4 w-4 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]"
      : "group relative inline-grid h-5 w-5 place-items-center rounded-full text-[#6f7e98] hover:text-[#2f64ef]";
  const tooltipClassName =
    size === "sm"
      ? "pointer-events-none absolute left-1/2 top-6 z-20 hidden w-[280px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs normal-case tracking-normal text-[#334766] shadow-md group-hover:block"
      : "pointer-events-none absolute left-1/2 top-7 z-20 hidden w-[320px] -translate-x-1/2 rounded-lg border border-line/70 bg-white p-2 text-left text-ui-xs text-[#334766] shadow-md group-hover:block";

  return (
    <button type="button" className={buttonClassName} aria-label={label}>
      <CircleHelp className={iconClassName} />
      <span className={tooltipClassName}>{children}</span>
    </button>
  );
}
