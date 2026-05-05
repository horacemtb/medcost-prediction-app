import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, children, className = "" }: FormSectionProps) {
  return (
    <div className={`form-section rounded-2xl border border-line/70 bg-white/5 p-4 md:p-5 ${className}`.trim()}>
      <h3 className="mb-3 text-ui-md font-semibold text-txt">{title}</h3>
      {children}
    </div>
  );
}

