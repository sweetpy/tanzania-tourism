import { NextResponse } from "next/server";
import { packages } from "@/data/packages";
import { appendLead } from "@/lib/leads";
import { notifyFounder } from "@/lib/notify";

type PartnerBody = {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  country?: string;
  website?: string;
  markets?: string;
  packageInterest?: string;
  message?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: PartnerBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companyName = (body.companyName || "").trim();
  const contactName = (body.contactName || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const country = (body.country || "").trim();
  const website = (body.website || "").trim();
  const markets = (body.markets || "").trim();
  const packageInterest = (body.packageInterest || "").trim();
  const message = (body.message || "").trim();

  if (companyName.length < 2) {
    return NextResponse.json(
      { error: "Please enter your company name." },
      { status: 400 },
    );
  }
  if (contactName.length < 2) {
    return NextResponse.json(
      { error: "Please enter a contact name." },
      { status: 400 },
    );
  }
  if (!emailRe.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid work email." },
      { status: 400 },
    );
  }
  if (country.length < 2) {
    return NextResponse.json(
      { error: "Please share your country / HQ." },
      { status: 400 },
    );
  }
  if (markets.length < 3) {
    return NextResponse.json(
      { error: "Please describe the markets you sell." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please add a short message (at least 10 characters)." },
      { status: 400 },
    );
  }

  if (packageInterest) {
    const exists = packages.some((p) => p.slug === packageInterest);
    if (!exists) {
      return NextResponse.json(
        { error: "Invalid package selection." },
        { status: 400 },
      );
    }
  }

  const application = {
    id: `ptr_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    companyName,
    contactName,
    email,
    phone: phone || null,
    country,
    website: website || null,
    markets,
    packageInterest: packageInterest || null,
    message,
  };

  const stored = await appendLead("partner", application.id, application);
  if (!stored.ok) {
    console.error("[partner] lead log failed:", stored.error);
    return NextResponse.json(
      {
        error:
          "We could not save your application right now. Please try again shortly, or email us directly.",
      },
      { status: 503 },
    );
  }

  const notified = await notifyFounder("partner", application.id, application);
  console.info(
    "[partner]",
    application.id,
    "stored:",
    stored.path,
    "notify:",
    notified.sent ? notified.channel : notified.reason,
  );

  return NextResponse.json({
    success: true,
    id: application.id,
    stored: true,
    emailed: notified.sent,
    message: notified.sent
      ? "Application received — our partnerships team has been notified and will follow up within a few business days."
      : "Application received and saved. We review partner applications regularly and will follow up within a few business days.",
  });
}
