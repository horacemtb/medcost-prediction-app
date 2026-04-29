import type { ReactNode } from "react";

type ErrorAlertProps = {
  message: string;
  className?: string;
};

export function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return <div className={`error ${className}`.trim()}>{message}</div>;
}

type MiniStatCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MiniStatCard({ label, value, className = "" }: MiniStatCardProps) {
  return (
    <article className={`tile mini ${className}`.trim()}>
      <p className="tiny">{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

type InfoSectionCardProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export function InfoSectionCard({ title, subtitle, className = "", children }: InfoSectionCardProps) {
  return (
    <section className={`tile form-tile ${className}`.trim()}>
      <h3>{title}</h3>
      {subtitle && <p className="muted">{subtitle}</p>}
      {children}
    </section>
  );
}

type PlaceholderCardProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderCard({ title, subtitle }: PlaceholderCardProps) {
  return (
    <section className="tile form-tile placeholder-page">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
    </section>
  );
}
