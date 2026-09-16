import { NextResponse } from "next/server";
import { packages } from "@/data/packages";
import { experiences } from "@/data/experiences";

type EnquireBody = {
  name?: string;
  email?: string;
  phone?: string;
  travelDates?: string;
  partySize?: string | number;
  interests?: string[];
  packageSlug?: string;
  message?: string;
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

  // Stub persistence — replace with CRM / email / database later.
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
  };

  console.info("[enquire]", JSON.stringify(enquiry));

  return NextResponse.json({
    success: true,
    id: enquiry.id,
    message: "Enquiry received successfully.",
  });
}
