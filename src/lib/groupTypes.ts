export type GroupKind =
  "safari" | "hiking" | "climbing" | "culture" | "special";
export type DepartureStatus =
  "proposed" | "open" | "guaranteed" | "cancelled" | "draft";
export type RegistrationStatus =
  | "interest"
  | "requested"
  | "waitlisted"
  | "offered"
  | "accepted"
  | "confirmed"
  | "cancellation-requested"
  | "cancelled";
export type GroupTemplate = {
  id: string;
  name: string;
  kind: GroupKind;
  days: number;
  mountainDays?: number;
  town: string;
  summary: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  packageSlug?: string;
  minimumAge: number;
  level: string;
  rhythm: string;
  months: number[];
  programme: { day: number; title: string; description: string }[];
  includes: string[];
  excludes: string[];
  preparation: string[];
  meeting: string;
  source: string;
  offset: number;
  weekday: number;
};
export type Departure = {
  id: string;
  templateId: string;
  startDate: string;
  endDate: string;
  status: DepartureStatus;
  title: string;
  note: string;
  capacity: number | null;
  minimumGroup: number;
  currency: "USD" | "TZS";
  adultPriceMinor: number | null;
  priceNote: string;
  deadline: string;
  occupied: number;
  interested: number;
  version: number;
};
export type GroupContact = {
  name: string;
  email: string;
  phone: string;
  adults: number;
  childAges: number[];
  notes: string;
  marketing: boolean;
  consent: boolean;
  website?: string;
  requestKey: string;
  departureId: string;
  waitlist: boolean;
  attribution: string;
  residency: "tz-resident" | "eac-resident" | "non-resident" | "unsure";
};
export type Registration = {
  id: string;
  departureId: string;
  createdAt: string;
  status: RegistrationStatus;
  contact: GroupContact;
  seats: number;
  offerTotalMinor: number | null;
  offerCurrency: "USD" | "TZS";
  offerTerms: string;
  holdUntil: string | null;
  paymentReference: string;
  updatedAt: string;
};
