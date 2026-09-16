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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            {subtitle}
          </p>
        )}
        <h3 className="mt-1 font-serif text-xl text-stone-900">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        {meta && <p className="mt-1 text-sm font-medium text-stone-500">{meta}</p>}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
          {description}
        </p>
        <Link
          href={href}
          className="mt-4 text-sm font-semibold text-amber-900 hover:text-amber-700"
        >
          {cta} →
        </Link>
      </div>
    </article>
  );
}
