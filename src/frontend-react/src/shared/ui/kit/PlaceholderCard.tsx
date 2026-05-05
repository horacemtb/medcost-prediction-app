type PlaceholderCardProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderCard({ title, subtitle }: PlaceholderCardProps) {
  return (
    <section className="tile form-tile placeholder-page rounded-2xl border border-line/70 bg-white/5 p-6">
      <h2 className="text-ui-lg font-semibold text-txt">{title}</h2>
      <p className="muted mt-2 text-ui-sm text-muted">{subtitle}</p>
    </section>
  );
}

