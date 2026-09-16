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
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <p
          className={`type-eyebrow ${
            light ? "text-gold" : "text-terracotta"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`type-h2 mt-3 font-display font-extrabold ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`type-body mt-5 max-w-2xl ${
            light ? "text-cream/65" : "text-ink/60"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
