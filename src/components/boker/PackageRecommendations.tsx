"use client";

import Link from "next/link";
import { packages, packagePriceLabel } from "@/data/packages";
import {
  recommendPackages,
  packageEnquiryHref,
} from "@/lib/packageRecommendations";
import type { BokerConfig, BokerTripRequest } from "@/lib/bokerTypes";

export function PackageRecommendations({
  request,
  config,
  childrenText,
}: {
  request: BokerTripRequest;
  config: BokerConfig | null;
  childrenText: string;
}) {
  const chosen =
    config?.destinations.filter((destination) =>
      request.destinationIds.includes(destination.id),
    ) || [];
  const matches = recommendPackages(packages, {
    parkIds: chosen.map((destination) => destination.parkId),
    days: request.days,
    arrivalDate: request.arrivalDate,
  });
  if (!config || !chosen.length) return null;
  const tokens = childrenText.trim()
    ? childrenText.split(",").map((token) => token.trim())
    : [];
  const validChildren = tokens.every(
    (token) => /^\d{1,2}$/.test(token) && Number(token) <= 17,
  );
  const validParty =
    validChildren &&
    Number.isInteger(request.adults) &&
    request.adults >= 1 &&
    request.adults + tokens.length <= 20;
  const contextualRequest = {
    ...request,
    childAges: validChildren ? tokens.map(Number) : [],
  };
  const samePriceBasis =
    request.adults === 2 &&
    !tokens.length &&
    request.travellerFeeCategory === "non-east-african";
  return (
    <section
      className="boker-journey boker-recommendations boker-no-print"
      aria-labelledby="prepared-journeys"
    >
      <div className="boker-section-heading">
        <div>
          <span className="boker-eyebrow">A LITTLE INSPIRATION</span>
          <h2 id="prepared-journeys">
            Prepared journeys for your chosen places
          </h2>
        </div>
        <Link href="/packages" className="boker-secondary">
          Browse all packages →
        </Link>
      </div>
      <p className="boker-recommendation-note">
        Explore a complete route while building your own. Package lengths
        include arrival and departure days; compare the daily plan with your
        requested {request.days} safari days. These budgets do not price your
        custom itinerary.
      </p>
      {matches.length ? (
        <div className="boker-package-grid">
          {matches.map((pkg) => (
            <article
              key={pkg.slug}
              data-package-code={pkg.code}
              className="boker-package-card"
            >
              <span className="boker-eyebrow">{pkg.duration}</span>
              <h3>
                <Link href={`/packages/${pkg.slug}`}>{pkg.name}</Link>
              </h3>
              <p>{pkg.summary}</p>
              <p className="boker-package-fit">
                Includes{" "}
                {chosen.map((destination) => destination.label).join(" + ")}.{" "}
                {pkg.days === request.days
                  ? "Same total day count, including arrival and departure."
                  : `${Math.abs(pkg.days - request.days)} ${Math.abs(pkg.days - request.days) === 1 ? "day" : "days"} ${pkg.days > request.days ? "longer" : "shorter"} in total.`}
              </p>
              {pkg.seasonMonths.length > 0 && (
                <p className="boker-package-fit">
                  Seasonal route: {pkg.travelWindow}
                </p>
              )}
              <p className="boker-package-budget">
                {packagePriceLabel(pkg, request.budgetTier)}
              </p>
              <p className="boker-package-basis">
                {samePriceBasis
                  ? "Brochure basis: two non-resident adults sharing a room and private vehicle."
                  : "Brochure basis is two non-resident adults sharing. Your party needs a separate quote."}
                {request.budgetGrade === "premium" &&
                  " Premium upgrades require a separate quote."}
              </p>
              <div className="boker-package-actions">
                <Link href={`/packages/${pkg.slug}`}>
                  View full itinerary →
                </Link>
                {validParty ? (
                  <Link
                    href={packageEnquiryHref(
                      pkg.slug,
                      contextualRequest,
                      chosen.map((destination) => destination.label),
                    )}
                  >
                    Ask about this package →
                  </Link>
                ) : (
                  <span>
                    Check the adults and children&apos;s ages above. Up to 20
                    travellers can carry their details into an enquiry.
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="boker-empty">
          <p>
            No prepared brochure covers all these places for this season. Keep
            building your custom route, or explore the full package catalogue.
          </p>
        </div>
      )}
    </section>
  );
}
