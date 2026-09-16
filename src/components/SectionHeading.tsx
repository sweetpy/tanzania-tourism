type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: Props) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-800">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
