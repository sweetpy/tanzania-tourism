"use client";
import { useSyncExternalStore } from "react";
import type {
  Departure,
  GroupTemplate,
  RegistrationStatus,
} from "@/lib/groupTypes";
import {
  formatGroupDate,
  groupMoney,
  todayInTanzania,
} from "@/lib/groupPolicy";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight, Heart } from "lucide-react";
const subscribe = () => () => {};
export const useGroupReady = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
export const registrationLabels: Record<RegistrationStatus, string> = {
  interest: "Interest registered",
  requested: "Places requested",
  waitlisted: "On the waitlist",
  offered: "Places offered",
  accepted: "Offer accepted",
  confirmed: "Booking confirmed",
  "cancellation-requested": "Cancellation being reviewed",
  cancelled: "Registration cancelled",
};
export function DepartureBadge({ departure }: { departure: Departure }) {
  const full =
      departure.capacity !== null && departure.occupied >= departure.capacity,
    closed = departure.deadline < todayInTanzania();
  return (
    <span className={`group-badge status-${departure.status}`}>
      {departure.status === "cancelled"
        ? "Cancelled"
        : closed
          ? "Registration closed"
          : departure.status === "proposed"
            ? "Proposed date"
            : departure.status === "guaranteed"
              ? "Departure confirmed"
              : full
                ? "Waitlist open"
                : "Taking requests"}
    </span>
  );
}
export function GroupCard({
  departure: d,
  template: t,
  saved,
  onSave,
}: {
  departure: Departure;
  template: GroupTemplate;
  saved?: boolean;
  onSave?: () => void;
}) {
  return (
    <article className="group-trip-card">
      <div className="group-trip-photo">
        <Image
          src={t.image}
          alt={t.imageAlt}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <DepartureBadge departure={d} />
        {onSave && (
          <button
            className="group-save"
            aria-label={`${saved ? "Remove saved" : "Save"} ${d.title}`}
            aria-pressed={saved}
            onClick={onSave}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      <div className="group-trip-copy">
        <p className="group-eyebrow">
          {d.id.startsWith("seasonal-") ? "Themed outing" : t.kind} ·{" "}
          {t.days === 1 ? "Day trip" : `${t.days} days`}
        </p>
        <h3>
          <Link href={`/groups/${d.id}`}>{d.title}</Link>
        </h3>
        <p className="group-icon-line">
          <CalendarDays size={16} />
          {formatGroupDate(d.startDate, d.endDate)}
        </p>
        <p className="group-icon-line">
          <MapPin size={16} />
          From {t.town}
          {t.mountainDays ? ` · ${t.mountainDays} mountain days` : ""}
        </p>
        <p className="group-card-summary">{t.summary}</p>
        <div className="group-card-price">
          <strong>{groupMoney(d.adultPriceMinor, d.currency)}</strong>
          {d.adultPriceMinor !== null && (
            <small>per adult · supplements and child rates in your offer</small>
          )}
          {d.status !== "proposed" && d.capacity !== null && (
            <small>
              {Math.max(0, d.capacity - d.occupied)} places currently available
            </small>
          )}
        </div>
        <Link className="group-text-link" href={`/groups/${d.id}`}>
          Explore this departure <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
