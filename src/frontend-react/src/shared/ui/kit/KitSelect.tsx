import { Children, isValidElement, type ReactNode, type SelectHTMLAttributes } from "react";

type KitSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

type SelectOptionNode = {
  value?: unknown;
  children?: ReactNode;
};

function isPlaceholderSelected(children: ReactNode, currentValue: unknown, placeholderText?: string) {
  if (!placeholderText) return false;

  const selectedValue = currentValue === undefined || currentValue === null ? "" : String(currentValue);

  return Children.toArray(children).some((child) => {
    if (!isValidElement<SelectOptionNode>(child)) return false;

    const optionValue =
      child.props.value === undefined || child.props.value === null
        ? ""
        : String(child.props.value);

    if (optionValue !== selectedValue) return false;

    return String(child.props.children ?? "").trim() === placeholderText;
  });
}

export function KitSelect({
  className = "",
  children,
  value,
  defaultValue,
  placeholderText,
  ...props
}: KitSelectProps & { placeholderText?: string }) {
  const isPlaceholder = isPlaceholderSelected(children, value ?? defaultValue, placeholderText);

  return (
    <select
      className={`h-8 w-full appearance-none rounded-xl border border-line/70 bg-[length:10px_10px] bg-[right_0.65rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'%3E%3Cpath d='M2 3.5L5 6.5L8 3.5' stroke='%23627188' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")] bg-no-repeat px-3 pr-9 text-ui-sm outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/25 ${
        isPlaceholder ? "text-muted" : "text-txt"
      } ${className}`.trim()}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      {children}
    </select>
  );
}
