/** Public JSON contracts shared with the Boker planning API; no server runtime imports. */
export type BokerCircuit = "northern" | "southern";

export interface BokerTripRequest {
  arrivalDate: string;
  days: number;
  adults: number;
  childAges: number[];
  travellerFeeCategory: "non-east-african" | "expatriate-resident" | "east-african-citizen";
  destinationIds: string[];
  budgetTier: "budget" | "midrange" | "luxury";
  budgetGrade: "classic" | "premium" | null;
}

export interface BokerConfig {
  destinations: {
    id: string;
    label: string;
    circuit: BokerCircuit;
    parkId: string;
    source: string;
  }[];
  enquiriesAvailable: boolean;
}

export interface BokerDay {
  day: number;
  date: string;
  parkId: string;
  parkName: string;
  summary: string;
  overnight: string | null;
  travelNote: string | null;
}

export interface BokerOption {
  id: string;
  title: string;
  circuit: BokerCircuit;
  gateway: string;
  nights: number;
  days: BokerDay[];
  route: { parkId: string; parkName: string; nights: number }[];
  hotels: { parkId: string; name: string; url: string; status: "proposed" }[];
  pricing: {
    status: "estimate" | "needs-review";
    message: string;
    currency?: "USD" | "TZS";
    totalMinor?: number;
    reasons: string[];
  };
  status: "draft";
}

export interface BokerPreview {
  request: BokerTripRequest;
  options: BokerOption[];
  disclaimer: string;
}

export interface BokerEnquiryReceipt {
  saved: boolean;
  reference: string;
  emailSent: boolean;
}
