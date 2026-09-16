/** Market-offer → enquire attribution helpers. Preserve UTMs when present. */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export type UtmParams = Partial<Record<UtmKey, string>>;

export type MarketOfferId = "us" | "eu-beach" | "uk";

/** Default featured offer is US safari. */
export const MARKET_OFFER_PARAMS: Record<
  MarketOfferId,
  { market: string; interest: string }
> = {
  us: { market: "us", interest: "safari" },
  "eu-beach": { market: "eu", interest: "beach-islands" },
  uk: { market: "uk", interest: "mountain-climbing" },
};

export function pickUtms(
  source: URLSearchParams | Record<string, string | undefined | null>,
): UtmParams {
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const raw =
      source instanceof URLSearchParams
        ? source.get(key)
        : (source[key] ?? null);
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value) out[key] = value;
  }
  return out;
}

export function buildEnquireHref(opts: {
  market: string;
  interest: string;
  utms?: UtmParams;
  packageSlug?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.market) params.set("market", opts.market);
  if (opts.interest) params.set("interest", opts.interest);
  if (opts.packageSlug) params.set("package", opts.packageSlug);
  if (opts.utms) {
    for (const key of UTM_KEYS) {
      const v = opts.utms[key];
      if (v) params.set(key, v);
    }
  }
  const qs = params.toString();
  return qs ? `/enquire?${qs}` : "/enquire";
}
