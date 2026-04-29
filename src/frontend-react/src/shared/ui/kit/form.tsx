import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, children, className = "" }: FormSectionProps) {
  return (
    <div className={`form-section ${className}`.trim()}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

type FieldMetaProps = {
  error?: string;
  hint?: string;
};

export function FieldMeta({ error, hint }: FieldMetaProps) {
  if (error) return <small className="field-error">{error}</small>;
  if (hint) return <small className="field-hint">{hint}</small>;
  return null;
}

type KitInputProps = InputHTMLAttributes<HTMLInputElement>;

export function KitInput({ className = "", ...props }: KitInputProps) {
  return <input className={`kit-input ${className}`.trim()} {...props} />;
}

type KitSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function KitSelect({ className = "", children, ...props }: KitSelectProps) {
  return (
    <select className={`kit-input ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

type KitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost" | "tab" | "sort";
};

export function KitButton({ className = "", variant = "default", ...props }: KitButtonProps) {
  return <button className={`kit-button kit-button--${variant} ${className}`.trim()} {...props} />;
}

type KitCheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function KitCheckbox({ className = "", label, ...props }: KitCheckboxProps) {
  return (
    <label className={`kit-checkbox ${className}`.trim()}>
      <input type="checkbox" className="kit-checkbox__input" {...props} />
      <span className="kit-checkbox__label">{label}</span>
    </label>
  );
}
