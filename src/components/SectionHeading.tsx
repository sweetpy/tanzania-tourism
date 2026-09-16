type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      {eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.25em] ${
            light ? "text-gold-bright" : "text-terracotta"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            light ? "text-cream/70" : "text-ink/65"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
