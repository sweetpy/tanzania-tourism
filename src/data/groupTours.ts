import { getPackage } from "@/data/packages";
import type { Departure, GroupTemplate, GroupKind } from "@/lib/groupTypes";
import { addDays, todayInTanzania } from "@/lib/groupPolicy";

function fromBrochure(
  id: string,
  slug: string,
  kind: GroupKind,
  rhythm: string,
  offset: number,
  weekday = 6,
): GroupTemplate {
  const pkg = getPackage(slug);
  if (!pkg?.itinerary) throw new Error(`Missing group programme: ${slug}`);
  return {
    id,
    name: pkg.name,
    kind,
    days: pkg.days,
    town: pkg.departureTown || "Arusha",
    summary: pkg.summary,
    image: pkg.image.includes("Moshi_facing")
      ? "/images/groups/kilimanjaro.jpg"
      : pkg.image.includes("Look_at_Mt")
        ? "/images/groups/meru.jpg"
        : pkg.image.includes("Serengeti-Landscape")
          ? "/images/groups/serengeti.jpg"
          : "/images/groups/manyara.jpg",
    imageAlt: pkg.imageAlt,
    imageCredit: "/groups/credits",
    packageSlug: slug,
    minimumAge: kind === "hiking" ? 8 : 0,
    level:
      kind === "hiking"
        ? "Guided walking; ask about route suitability"
        : "Vehicle safari or gentle activity",
    rhythm,
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    programme: pkg.itinerary.map((d) => ({
      day: d.day,
      title: d.title,
      description: d.description,
    })),
    includes: pkg.includes,
    excludes: pkg.excludes || [],
    preparation: [
      "Arrive in the departure town before the meeting time. Ask us to arrange airport transfers or an extra hotel night.",
      "Tell us about access, dietary and room requirements before the group plan is confirmed.",
      "The dated group quote confirms transport, services, rooms, fees and cancellation terms.",
    ],
    meeting:
      pkg.kind === "day-trip"
        ? `Central ${pkg.departureTown} hotel pickup. The final pickup time is confirmed with your booking.`
        : "Meet in Arusha on the first day for arrival arrangements and your trip briefing.",
    source: pkg.source?.document || "Boker prepared itinerary",
    offset,
    weekday,
  };
}
const kiliImage = "/images/groups/kilimanjaro.jpg";
const meruImage = "/images/groups/meru.jpg";
function mountain(
  id: string,
  name: string,
  mountainDays: number,
  town: string,
  camps: string[],
  offset: number,
): GroupTemplate {
  const meru = id === "mount-meru";
  return {
    id,
    name,
    kind: "climbing",
    days: mountainDays + 2,
    mountainDays,
    town,
    summary: meru
      ? "A four-day guided Mount Meru trek with an arrival night, mountain briefing and a return hotel night."
      : `A ${mountainDays}-day guided Kilimanjaro route, plus arrival and departure days in Moshi. Meet your group, review equipment and climb at the guide’s pace.`,
    image: meru ? meruImage : kiliImage,
    imageAlt: meru
      ? "Mount Meru seen from Arusha"
      : "Mount Kilimanjaro seen from Moshi",
    imageCredit: "/groups/credits",
    packageSlug: id === "lemosho" ? "kilimanjaro-lemosho" : undefined,
    minimumAge: 16,
    level: "Strenuous multi-day mountain trek; group policy: ages 16+",
    rhythm: "Monthly mountain departure",
    months: [1, 2, 6, 7, 8, 9, 10],
    programme: [
      {
        day: 1,
        title: `Arrival and briefing in ${town}`,
        description:
          "Meet the group and mountain team. Review the route, equipment, personal preparation and final arrangements. Arrive in time for the briefing; extra transfers and early arrival can be arranged.",
      },
      ...camps.map((title, i) => ({
        day: i + 2,
        title,
        description:
          i === camps.length - 1
            ? "Descend with your guide, complete park formalities and return to town for a hotel night. The route and pace remain subject to weather, park access and the guide’s decisions."
            : title.includes("Summit")
              ? "A very early start with the mountain team. Progress and turnaround decisions depend on conditions and each climber’s wellbeing. A summit is never guaranteed. Descend to the planned overnight stop."
              : "Walk with the mountain team to the next overnight stop, with time for breaks, meals and the guide’s daily briefing. Distances and pace are confirmed during the trip briefing.",
      })),
      {
        day: mountainDays + 2,
        title: "Departure or extend your stay",
        description:
          "After breakfast, continue with your departure arrangements. Ask about adding a safari, a rest day or Zanzibar. Airport transfers are confirmed in your quote.",
      },
    ],
    includes: [
      "Proposed: guided mountain programme, park arrangements and mountain overnight stops.",
      "Proposed: arrival and return hotel nights, trail meals and drinking-water arrangements.",
      "The written offer lists the confirmed guiding team, porters, equipment, permits, transfers and hotel services.",
    ],
    excludes: [
      "International flights, visas, personal insurance and voluntary tips.",
      "Personal trekking equipment, extra hotel nights and services not listed in the final quote.",
    ],
    preparation: [
      "This is a demanding mountain trip. Discuss your experience and suitability with the team before accepting an offer.",
      "The team confirms required equipment, altitude-appropriate insurance and the pre-departure checklist. Equipment hire is quoted separately.",
      "Arrive before the group briefing. Guides may change or stop the route because of conditions or individual wellbeing.",
      "For these group climbs, guests must be at least 16. Travellers under 18 must join with a responsible adult.",
    ],
    meeting: `${town} hotel on the arrival day. Book travel that allows time for the afternoon mountain briefing.`,
    source: meru
      ? "https://www.tanzaniaparks.go.tz/uploads/publications/en-1633611951-AM-ENG.pdf"
      : "https://www.tanzaniaparks.go.tz/uploads/publications/en-1633027058-KI.pdf",
    offset,
    weekday: 0,
  };
}
export const groupTemplates: GroupTemplate[] = [
  fromBrochure(
    "marangu-hike",
    "day-trip-kili-marangu",
    "hiking",
    "First Saturday trail day",
    0,
  ),
  fromBrochure(
    "materuni",
    "day-trip-materuni",
    "hiking",
    "Third Saturday waterfall and coffee walk",
    14,
  ),
  fromBrochure(
    "duluti",
    "day-trip-duluti",
    "hiking",
    "Fourth Saturday lake outing",
    21,
  ),
  fromBrochure(
    "tarangire-weekend",
    "2-day-tarangire-safari",
    "safari",
    "Second weekend safari",
    7,
  ),
  fromBrochure(
    "crater-weekend",
    "3-day-tarangire-ngorongoro",
    "safari",
    "Fourth weekend safari",
    21,
    5,
  ),
  fromBrochure(
    "northern-safari",
    "classic-northern-safari",
    "safari",
    "Monthly northern parks journey",
    7,
    0,
  ),
  mountain(
    "machame",
    "Kilimanjaro: seven-day Machame climb",
    7,
    "Moshi",
    [
      "Machame Gate to Machame Camp",
      "Machame Camp to Shira Camp",
      "Shira, Lava Tower and Barranco",
      "Barranco to Karanga",
      "Karanga to Barafu",
      "Summit attempt and descent to Mweka Camp",
      "Mweka Gate and return to Moshi",
    ],
    0,
  ),
  mountain(
    "lemosho",
    "Kilimanjaro: eight-day Lemosho climb",
    8,
    "Moshi",
    [
      "Londorossi access to forest camp",
      "Forest camp to Shira 1",
      "Shira 1 to Shira 2",
      "Shira, Lava Tower and Barranco",
      "Barranco to Karanga",
      "Karanga to Barafu",
      "Summit attempt and descent to Mweka Camp",
      "Mweka Gate and return to Moshi",
    ],
    14,
  ),
  mountain(
    "mount-meru",
    "Mount Meru: four-day trek",
    4,
    "Arusha",
    [
      "Momella Gate to Miriakamba Hut",
      "Miriakamba to Saddle Hut",
      "Summit attempt and return to Miriakamba",
      "Momella Gate and return to Arusha",
    ],
    21,
  ),
  {
    ...fromBrochure(
      "community-day",
      "day-trip-tengeru-coffee",
      "culture",
      "Monthly community and coffee day",
      7,
    ),
    name: "Tengeru community and coffee day",
  },
];
export const getGroupTemplate = (id: string) =>
  groupTemplates.find((t) => t.id === id);
export function seedGroupCalendar(now = new Date(), months = 12): Departure[] {
  const today = todayInTanzania(now),
    earliest = addDays(today, 14),
    first = new Date(today + "T12:00:00Z"),
    result: Departure[] = [];
  for (let offset = 0; offset < months; offset++) {
    const month = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + offset, 1),
    );
    for (const t of groupTemplates) {
      if (!t.months.includes(month.getUTCMonth() + 1)) continue;
      const firstWeekday = (t.weekday - month.getUTCDay() + 7) % 7;
      const startDate = addDays(
        month.toISOString().slice(0, 10),
        firstWeekday + t.offset,
      );
      if (startDate < (t.kind === "climbing" ? addDays(today, 45) : earliest))
        continue;
      result.push({
        id: `${t.id}-${startDate}`,
        templateId: t.id,
        startDate,
        endDate: addDays(startDate, t.days - 1),
        title: t.name,
        status: "proposed",
        note: "A pre-planned group departure. Register interest while we arrange the group, suppliers and final quote.",
        capacity: null,
        minimumGroup: t.kind === "climbing" ? 4 : 6,
        currency: "USD",
        adultPriceMinor: null,
        priceNote:
          "Group rates are confirmed separately. Private-party brochure estimates are not group-joining prices.",
        deadline: addDays(startDate, t.kind === "climbing" ? -30 : -5),
        occupied: 0,
        interested: 0,
        version: 1,
      });
    }
  }
  // Boker-owned themed outings, not third-party festival tickets or affiliations.
  for (let offset = 0; offset < months; offset++) {
    const month = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + offset, 1),
    );
    if (![3, 7, 12].includes(month.getUTCMonth() + 1)) continue;
    const t = getGroupTemplate(
      month.getUTCMonth() === 11 ? "crater-weekend" : "materuni",
    )!;
    const startDate = addDays(
      month.toISOString().slice(0, 10),
      ((6 - month.getUTCDay() + 7) % 7) + 14,
    );
    if (startDate < earliest) continue;
    result.push({
      id: `seasonal-${startDate}`,
      templateId: t.id,
      startDate,
      endDate: addDays(startDate, t.days - 1),
      title:
        month.getUTCMonth() === 11
          ? "Year-end safari together"
          : month.getUTCMonth() === 2
            ? "Women outdoors: waterfall and coffee day"
            : "Mid-year waterfall and coffee outing",
      status: "proposed",
      note: "A Boker themed group outing. Register interest; date, hosts, transport and price are confirmed before booking.",
      capacity: null,
      minimumGroup: 6,
      currency: "TZS",
      adultPriceMinor: null,
      priceNote: "Price confirmed in the group offer.",
      deadline: addDays(startDate, -7),
      occupied: 0,
      interested: 0,
      version: 1,
    });
  }
  return result.sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id),
  );
}
