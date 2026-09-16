import { NextResponse } from "next/server";
import { packages } from "@/data/packages";
import { experiences } from "@/data/experiences";
import { appendLead } from "@/lib/leads";
import { notifyFounder } from "@/lib/notify";

type EnquireBody = {
  name?: string;
  email?: string;
  phone?: string;
  travelDates?: string;
  partySize?: string | number;
  interests?: string[];
  packageSlug?: string;
  message?: string;
  market?: string;
  interest?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: EnquireBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const travelDates = (body.travelDates || "").trim();
  const message = (body.message || "").trim();
  const packageSlug = (body.packageSlug || "").trim();
  const interests = Array.isArray(body.interests) ? body.interests : [];
  const partySizeNum = Number(body.partySize);

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 },
    );
  }
  if (!emailRe.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (travelDates.length < 3) {
    return NextResponse.json(
      { error: "Please share your approximate travel dates." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(partySizeNum) || partySizeNum < 1 || partySizeNum > 30) {
    return NextResponse.json(
      { error: "Party size must be between 1 and 30." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please add a short message (at least 10 characters)." },
      { status: 400 },
    );
  }

  const validInterestSlugs = new Set(experiences.map((e) => e.slug));
  for (const interest of interests) {
    if (!validInterestSlugs.has(interest)) {
      return NextResponse.json(
        { error: "Invalid interest selection." },
        { status: 400 },
      );
    }
  }

  if (packageSlug) {
    const exists = packages.some((p) => p.slug === packageSlug);
    if (!exists) {
      return NextResponse.json(
        { error: "Invalid package selection." },
        { status: 400 },
      );
    }
  }

  const market = (body.market || "").trim().slice(0, 64);
  const interestAttr = (body.interest || "").trim().slice(0, 64);
  const utm_source = (body.utm_source || "").trim().slice(0, 120);
  const utm_medium = (body.utm_medium || "").trim().slice(0, 120);
  const utm_campaign = (body.utm_campaign || "").trim().slice(0, 120);
  const utm_term = (body.utm_term || "").trim().slice(0, 120);
  const utm_content = (body.utm_content || "").trim().slice(0, 120);

  const enquiry = {
    id: `enq_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    name,
    email,
    phone: phone || null,
    travelDates,
    partySize: partySizeNum,
    interests,
    packageSlug: packageSlug || null,
    message,
    market: market || null,
    interest: interestAttr || null,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_term: utm_term || null,
    utm_content: utm_content || null,
  };

  const stored = await appendLead("enquire", enquiry.id, enquiry);
  if (!stored.ok) {
    console.error("[enquire] lead log failed:", stored.error);
    return NextResponse.json(
      {
        error:
          "We could not save your enquiry right now. Please try again shortly, or email us directly.",
      },
      { status: 503 },
    );
  }

  const notified = await notifyFounder("enquire", enquiry.id, enquiry);
  console.info(
    "[enquire]",
    enquiry.id,
    "stored:",
    stored.path,
    "notify:",
    notified.sent ? notified.channel : notified.reason,
  );

  return NextResponse.json({
    success: true,
    id: enquiry.id,
    stored: true,
    emailed: notified.sent,
    message: notified.sent
      ? "Enquiry received — our team has been notified and will reply within 1–2 business days."
      : "Enquiry received and saved. Our team reviews submissions regularly and will reply within 1–2 business days.",
  });
}
