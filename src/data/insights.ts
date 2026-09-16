/**
 * Research-grounded trust signals.
 * Source files: tanzania-visitor-insights-facts.json,
 * tanzania-visitor-insights-report.md,
 * tanzania-visitor-operators-motivations-discovery.md
 * Do not invent figures — cite year + source label.
 */

export type TrustStat = {
  id: string;
  value: string;
  label: string;
  detail: string;
  year: number;
  source: string;
};

export const trustStats: TrustStat[] = [
  {
    id: "arrivals_2025",
    value: "2.29M",
    label: "International arrivals",
    detail: "United Republic of Tanzania, 2025",
    year: 2025,
    source: "2025 International Visitors' Exit Survey",
  },
  {
    id: "earnings_2025",
    value: "$4.41B",
    label: "Tourism earnings",
    detail: "USD 4,410.6 million, 2025",
    year: 2025,
    source: "2025 Exit Survey / Bank of Tanzania",
  },
  {
    id: "package_share_2025",
    value: "58.8%",
    label: "Travelled on a package",
    detail: "Share of surveyed URT visitors, 2025",
    year: 2025,
    source: "2025 Exit Survey Chart 2.10",
  },
  {
    id: "spend_package_2025",
    value: "$479",
    label: "Package spend / night",
    detail: "USD per person per night (package travellers)",
    year: 2025,
    source: "2025 Exit Survey Chart 2.30",
  },
];

export const topExitSurveyMarkets2025 = [
  { market: "United States", share: "12.4%" },
  { market: "Italy", share: "11.8%" },
  { market: "France", share: "7.0%" },
  { market: "Kenya", share: "6.4%" },
  { market: "United Kingdom", share: "6.0%" },
];

export const packageInsights = {
  urtPackageShare2025: 58.8,
  zanzibarPackageShare2025: 67.2,
  packageEarningsShareUrt2025: 75.2,
  agentInfoSourceShare2025: 49.1,
  spendPackagePpn2025: 479,
  spendNonPackagePpn2025: 203,
  arrivals2025: 2_294_495,
  earningsUsdMillion2025: 4410.6,
  sourceLabel: "2025 International Visitors' Exit Survey",
};

export const citationsFooter =
  "Figures cited from the 2025 International Visitors' Exit Survey (NBS / Immigration) and MNRT Maliasili Statistical Bulletin 2024 unless otherwise noted.";
