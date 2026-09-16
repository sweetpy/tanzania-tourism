import Image from "next/image";
import Link from "next/link";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  imageAlt: string;
  meta?: string;
  cta?: string;
};

export function Card({
  href,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  meta,
  cta = "Learn more",
}: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white/70 shadow-[0_1px_0_rgba(12,18,16,0.04)] transition duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-xl">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-60" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {subtitle && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            {subtitle}
          </p>
        )}
        <h3 className="mt-1 font-display text-xl font-bold text-ink">
          <Link href={href} className="hover:underline decoration-gold underline-offset-4">
            {title}
          </Link>
        </h3>
        {meta && (
          <p className="mt-1 text-sm font-medium text-ink/50">{meta}</p>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">
          {description}
        </p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal transition group-hover:gap-2"
        >
          {cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
