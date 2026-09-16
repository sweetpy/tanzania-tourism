import Image from "next/image";
import Link from "next/link";

type Size = "hero" | "tall" | "wide" | "square";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  image: string;
  imageAlt: string;
  size?: Size;
};

const sizeClass: Record<Size, string> = {
  hero: "mosaic-hero min-h-[22rem] md:min-h-[28rem] lg:min-h-full",
  tall: "mosaic-tall min-h-[16rem] md:min-h-[20rem]",
  wide: "mosaic-wide min-h-[14rem] md:min-h-[16rem]",
  square: "mosaic-square min-h-[14rem] md:min-h-[16rem]",
};

export function MosaicCard({
  href,
  title,
  subtitle,
  tagline,
  image,
  imageAlt,
  size = "square",
}: Props) {
  return (
    <Link
      href={href}
      className={`group relative isolate block overflow-hidden rounded-2xl ${sizeClass[size]}`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes={
          size === "hero"
            ? "(max-width: 1024px) 100vw, 55vw"
            : "(max-width: 768px) 100vw, 30vw"
        }
        className="object-cover transition duration-[1.4s] ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent opacity-90 transition group-hover:opacity-95" />
      <div className="absolute inset-0 bg-night/20 mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        {subtitle && (
          <p className="type-eyebrow text-gold">
            {subtitle}
          </p>
        )}
        <h3 className="type-card mt-1.5 font-display font-bold text-cream">
          {title}
        </h3>
        {tagline && (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/65 line-clamp-2">
            {tagline}
          </p>
        )}
      </div>
    </Link>
  );
}
