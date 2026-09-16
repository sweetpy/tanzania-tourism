import { NextResponse } from "next/server";
import { packages } from "@/data/packages";

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

  console.info("[partner]", JSON.stringify(application));

  return NextResponse.json({
    success: true,
    id: application.id,
    message: "Partner application received successfully.",
  });
}
