import { KitLoader } from "./KitLoader";

type LoadingStateProps = {
  label: string;
  cardClassName?: string;
};

export function LoadingState({ label, cardClassName = "" }: LoadingStateProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={`loading-card ${cardClassName}`.trim()}>
        <KitLoader label={label} />
      </div>
    </div>
  );
}
