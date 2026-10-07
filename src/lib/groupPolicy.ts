import type {
  Departure,
  GroupContact,
  GroupTemplate,
  RegistrationStatus,
} from "./groupTypes";

export class GroupError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export function todayInTanzania(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Dar_es_Salaam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}
export function addDays(date: string, days: number) {
  if (!validDate(date)) throw new GroupError("Choose a valid date.");
  const result = new Date(date + "T00:00:00Z");
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
export function formatGroupDate(date: string, end?: string) {
  const format = (d: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(d + "T12:00:00Z"));
  return end && end !== date
    ? `${format(date)} to ${format(end)}`
    : format(date);
}
export function groupMoney(minor: number | null, currency: "USD" | "TZS") {
  return minor === null
    ? "Group price to be confirmed"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "TZS" ? 0 : 2,
      }).format(minor / (currency === "USD" ? 100 : 1));
}
export function parseGroupCurrency(value: unknown): "USD" | "TZS" {
  if (value !== "USD" && value !== "TZS")
    throw new GroupError("Choose USD or TZS for this quote.");
  return value;
}
export function priceToMinor(
  value: unknown,
  currency: "USD" | "TZS",
  nullable = false,
): number | null {
  if (nullable && (value === "" || value === null || value === undefined))
    return null;
  if (typeof value !== "string" && typeof value !== "number")
    throw new GroupError("Enter a valid price.");
  if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
    throw new GroupError(
      "Enter a positive price with at most two decimal places.",
    );
  if (currency === "TZS" && !/^\d+$/.test(String(value)))
    throw new GroupError("Enter whole Tanzanian shillings.");
  const minor = Math.round(Number(value) * (currency === "USD" ? 100 : 1));
  if (!Number.isSafeInteger(minor) || minor < 1 || minor > 1_000_000_000)
    throw new GroupError("The price is outside the allowed range.");
  return minor;
}
function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string") {
    if (value === undefined && !required) return "";
    throw new GroupError("Please check the form fields.");
  }
  const result = value.trim().replace(/\u2014/g, ", ");
  if (result.length > max || (required && result.length < 2))
    throw new GroupError("Please check the form fields.");
  return result;
}
export function parseRegistration(
  raw: unknown,
  template: Pick<GroupTemplate, "minimumAge">,
): GroupContact {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new GroupError("Please check your registration.");
  const body = raw as Record<string, unknown>;
  const adults = Number(body.adults);
  if (!Number.isInteger(adults) || adults < 1 || adults > 12)
    throw new GroupError("Choose between one and twelve adults.");
  if (
    !Array.isArray(body.childAges) ||
    body.childAges.length > 11 ||
    body.childAges.some(
      (age) =>
        typeof age !== "number" ||
        !Number.isInteger(age) ||
        age < 0 ||
        age > 17,
    )
  )
    throw new GroupError("Enter each child’s age, from 0 to 17.");
  if (adults + body.childAges.length > 12)
    throw new GroupError(
      "One request can include up to twelve travellers. Contact us for a larger group.",
    );
  if (body.childAges.some((age) => age < template.minimumAge))
    throw new GroupError(
      `This departure is for ages ${template.minimumAge} and above. Ask us about a suitable private trip.`,
    );
  const email = text(body.email, 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new GroupError("Enter a valid email address.");
  if (body.consent !== true)
    throw new GroupError(
      "Please agree to be contacted about this trip and review the booking process.",
    );
  const requestKey = text(body.requestKey, 80, true);
  if (!/^[a-zA-Z0-9_-]{20,80}$/.test(requestKey))
    throw new GroupError("Refresh the page and try again.");
  const residency = body.residency ?? "unsure";
  if (
    !["tz-resident", "eac-resident", "non-resident", "unsure"].includes(
      String(residency),
    )
  )
    throw new GroupError("Choose your residency category.");
  return {
    name: text(body.name, 150, true),
    email,
    phone: text(body.phone, 60),
    adults,
    childAges: body.childAges as number[],
    notes: text(body.notes, 2000),
    marketing: body.marketing === true,
    consent: true,
    website: text(body.website, 100),
    departureId: text(body.departureId, 100, true),
    requestKey,
    waitlist: body.waitlist === true,
    attribution: text(body.attribution, 500),
    residency: residency as GroupContact["residency"],
  };
}
export function initialRegistrationStatus(
  departure: Departure,
  seats: number,
  allowWaitlist: boolean,
  today = todayInTanzania(),
): RegistrationStatus {
  if (
    departure.status === "draft" ||
    departure.status === "cancelled" ||
    departure.startDate < today ||
    departure.deadline < today
  )
    throw new GroupError("Registration for this departure is closed.", 409);
  if (departure.status === "proposed") return "interest";
  if (departure.capacity === null || departure.adultPriceMinor === null)
    throw new GroupError(
      "This departure is being updated. Please try again shortly.",
      409,
    );
  if (departure.capacity - departure.occupied < seats) {
    if (!allowWaitlist)
      throw new GroupError(
        "There are not enough places for your party. Choose the waitlist or another date.",
        409,
      );
    return "waitlisted";
  }
  return "requested";
}
export function calendarFile(
  departure: Departure,
  template: GroupTemplate,
  origin: string,
) {
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Boker Adventures//Group departures//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${departure.id}@bokeradventure.com`,
    `SEQUENCE:${departure.version}`,
    `STATUS:${departure.status === "cancelled" ? "CANCELLED" : departure.status === "proposed" ? "TENTATIVE" : "CONFIRMED"}`,
    "TRANSP:TRANSPARENT",
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z/, "Z")}`,
    `DTSTART;VALUE=DATE:${departure.startDate.replace(/-/g, "")}`,
    `DTEND;VALUE=DATE:${addDays(departure.endDate, 1).replace(/-/g, "")}`,
    `SUMMARY:${escape(`Boker: ${departure.title}${departure.status === "proposed" ? " (proposed date)" : ""}`)}`,
    `LOCATION:${escape(template.town + ", Tanzania")}`,
    `DESCRIPTION:${escape(`This calendar entry is a reminder, not a booking. ${departure.status === "proposed" ? "The date and group price need confirmation. " : ""}Details: ${origin}/groups/${departure.id}`)}`,
    `URL:${origin}/groups/${departure.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return (
    lines
      .flatMap((line) => {
        const chunks = [];
        let current = "";
        for (const char of line) {
          if (new TextEncoder().encode(current + char).length > 73) {
            chunks.push(current);
            current = " " + char;
          } else current += char;
        }
        chunks.push(current);
        return chunks;
      })
      .join("\r\n") + "\r\n"
  );
}
export function safeCsv(value: unknown) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^[\s]*[=+@-]/.test(text) ? "'" : "") +
    text.replace(/"/g, '""') +
    '"'
  );
}
