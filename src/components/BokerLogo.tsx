import type { SVGProps } from "react";

/** Compass geometry from the original Boker brand's Lucide icon. */
export function BokerCompass({ size = 34, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/** Original Boker Adventures compass and stacked wordmark. */
export function BokerLogo() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <BokerCompass aria-hidden="true" />
      <span className="font-sans text-[19px] font-bold leading-[1.1] tracking-[0.18em] sm:text-[22px]">
        BOKER
        <small className="mt-[5px] block text-[10px] tracking-[0.28em]">
          ADVENTURES
        </small>
      </span>
    </span>
  );
}
