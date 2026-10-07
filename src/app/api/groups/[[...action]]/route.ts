import { NextResponse } from "next/server";
import { groupTemplates, getGroupTemplate } from "@/data/groupTours";
import { calendarFile, GroupError, safeCsv } from "@/lib/groupPolicy";
import {
  assertSameOrigin,
  assertTeam,
  authenticatedGroupRequest,
  groupCookie,
  issueGroupSession,
  verifyGroupPassword,
  groupVisitorIdentity,
} from "@/lib/groupAuth";
import {
  getDeparture,
  getRegistration,
  listDepartures,
  listRegistrations,
  rateLimit,
  registerGroup,
  rotateRegistrationLink,
  saveDeparture,
  updateRegistration,
} from "@/lib/groupStore";
import { notifyFounder } from "@/lib/notify";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ action?: string[] }> };
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
function fail(error: unknown) {
  if (error instanceof GroupError)
    return json({ error: error.message }, error.status);
  console.error(
    "[group-tours] request failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json(
    { error: "We could not complete this request. Please try again shortly." },
    503,
  );
}
function ip(request: Request) {
  const visitor = groupVisitorIdentity(request);
  if (visitor) return visitor;
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1) ||
    "unknown"
  )
    .trim()
    .slice(0, 100);
}
async function body(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new GroupError("Send this form as JSON.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new GroupError("The form is empty.");
  const decoder = new TextDecoder();
  let raw = "",
    size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > 16000) {
      await reader.cancel();
      throw new GroupError("The form is too large.", 413);
    }
    raw += decoder.decode(chunk.value, { stream: true });
  }
  raw += decoder.decode();
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new GroupError("Invalid form data.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new GroupError("Invalid form data.");
  return value as Record<string, unknown>;
}
const token = (request: Request) =>
  request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
export async function GET(request: Request, context: Context) {
  try {
    const { action = [] } = await context.params;
    if (!action.length)
      return json({
        departures: await listDepartures(),
        templates: groupTemplates,
      });
    if (action[0] === "team") {
      assertTeam(request);
      return json({
        departures: await listDepartures(true),
        registrations: await listRegistrations(),
        templates: groupTemplates,
      });
    }
    if (action[0] === "session")
      return json({ signedIn: authenticatedGroupRequest(request) });
    if (action[0] === "calendar" && action.length === 1) {
      const departures = await listDepartures(),
        origin =
          process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com";
      const events = departures
        .map((d) => {
          const t = getGroupTemplate(d.templateId);
          return t
            ? calendarFile(d, t, origin).match(
                /BEGIN:VEVENT[\s\S]*END:VEVENT/,
              )?.[0]
            : "";
        })
        .filter(Boolean)
        .join("\r\n");
      return new Response(
        `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Boker Adventures//Group calendar//EN\r\nX-WR-CALNAME:Boker group departures\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR\r\n`,
        {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition":
              "attachment; filename=boker-group-calendar.ics",
            "Cache-Control": "no-store",
          },
        },
      );
    }
    if (action[0] === "registration" && action.length === 2) {
      await rateLimit(`lookup:${ip(request)}`, 120);
      const registration = await getRegistration(action[1], token(request)),
        departure = await getDeparture(registration.departureId, true);
      return json({
        registration,
        departures: departure ? [departure] : [],
        templates: groupTemplates,
      });
    }
    if (action[0] === "calendar" && action.length === 2) {
      const departure = await getDeparture(action[1]);
      const template = departure && getGroupTemplate(departure.templateId);
      if (!departure || !template)
        throw new GroupError("Departure not found.", 404);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com";
      return new Response(calendarFile(departure, template, origin), {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": `attachment; filename="boker-${departure.id}.ics"`,
          "Cache-Control": "no-store",
        },
      });
    }
    if (action[0] === "export") {
      assertTeam(request);
      const registrations = await listRegistrations();
      const csv = [
        [
          "Reference",
          "Departure",
          "Status",
          "Created",
          "Name",
          "Email",
          "Phone",
          "Adults",
          "Child ages",
          "Offer currency",
          "Offer total minor units",
          "Hold until",
          "Notes",
          "Marketing consent",
        ],
        ...registrations.map((r) => [
          r.id,
          r.departureId,
          r.status,
          r.createdAt,
          r.contact.name,
          r.contact.email,
          r.contact.phone,
          r.contact.adults,
          r.contact.childAges.join(" / "),
          r.offerCurrency,
          r.offerTotalMinor,
          r.holdUntil,
          r.contact.notes,
          r.contact.marketing ? "yes" : "no",
        ]),
      ]
        .map((row) => row.map(safeCsv).join(","))
        .join("\r\n");
      return new Response("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=boker-group-registrations.csv",
          "Cache-Control": "no-store",
        },
      });
    }
    throw new GroupError("Page not found.", 404);
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    const { action = [] } = await context.params;
    assertSameOrigin(
      request,
      action[0] === "team" || action[0] === "login" || action[0] === "logout",
    );
    if (action[0] === "logout") {
      const response = json({ success: true });
      response.cookies.set(groupCookie, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return response;
    }
    const raw = await body(request);
    if (action[0] === "login") {
      await rateLimit(`login:${ip(request)}`, 8, 15);
      if (!verifyGroupPassword(raw.password))
        throw new GroupError("The access code is incorrect.", 401);
      const response = json({ success: true });
      response.cookies.set(groupCookie, issueGroupSession(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 12 * 3600,
      });
      return response;
    }
    if (action[0] === "register") {
      await rateLimit(`register:${ip(request)}`, 20);
      const result = await registerGroup(raw);
      // Best-effort team notification; the registration is already safely committed.
      if (!result.repeated)
        await Promise.race([
          notifyFounder("enquire", result.id, {
            type: "group-registration",
            departureId: raw.departureId,
            name: raw.name,
            email: raw.email,
            phone: raw.phone,
            status: result.status,
            teamDesk: "https://www.bokeradventure.com/groups/desk",
          }),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      return json({ success: true, ...result }, result.repeated ? 200 : 201);
    }
    if (action[0] === "registration" && action.length === 2) {
      await rateLimit(`change:${ip(request)}`, 60);
      await getRegistration(action[1], token(request));
      return json({
        registration: await updateRegistration(
          action[1],
          String(raw.action || ""),
          raw,
          token(request),
        ),
      });
    }
    if (action[0] === "team") {
      assertTeam(request);
      if (action[1] === "departure")
        return json({ departure: await saveDeparture(raw) });
      if (action[1] === "registration" && action[2])
        return json({
          registration: await updateRegistration(
            action[2],
            String(raw.action || ""),
            raw,
          ),
        });
      if (action[1] === "link" && action[2])
        return json({ token: await rotateRegistrationLink(action[2]) });
    }
    throw new GroupError("Action not found.", 404);
  } catch (error) {
    return fail(error);
  }
}
