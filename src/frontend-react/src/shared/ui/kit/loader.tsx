type KitLoaderProps = {
  label?: string;
  className?: string;
};

export function KitLoader({ label = "Загрузка...", className = "" }: KitLoaderProps) {
  return (
    <div className={`kit-loader ${className}`.trim()} role="status" aria-live="polite" aria-busy="true">
      <span className="kit-loader__spinner" aria-hidden="true" />
      <span className="kit-loader__label">{label}</span>
    </div>
  );
}
