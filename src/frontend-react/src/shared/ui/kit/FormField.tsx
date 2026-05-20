import type { ReactNode } from "react";
import { FieldMeta } from "./FieldMeta";

type FormFieldProps = {
  label: ReactNode;
  children: ReactNode;
  error?: string;
  hint?: string;
  className?: string;
};

export function FormField({
  label,
  children,
  error,
  hint,
  className = "",
}: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <span className="text-ui-sm font-medium text-txt">{label}</span>
      {children}
      <FieldMeta error={error} hint={hint} />
    </label>
  );
}
