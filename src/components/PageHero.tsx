import type { ReactNode } from "react";
import Image from "next/image";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
  compact?: boolean;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  children,
  compact = false,
}: Props) {
  return (
    <section
      className={`relative isolate overflow-hidden grain ${
        compact ? "min-h-[42vh]" : "min-h-[52vh]"
      }`}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </div>
      <div
        className={`relative mx-auto flex max-w-7xl flex-col justify-end px-4 sm:px-6 lg:px-8 ${
          compact ? "pb-12 pt-28" : "pb-16 pt-32"
        }`}
      >
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-gold-bright">
          {eyebrow}
        </p>
        <h1 className="animate-fade-up-delay mt-4 max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-lg leading-relaxed text-cream/75">
            {description}
          </p>
        )}
        {children && (
          <div className="animate-fade-up-delay-2 mt-8">{children}</div>
        )}
      </div>
    </section>
  );
}
