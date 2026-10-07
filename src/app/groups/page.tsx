import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { groupTemplates, seedGroupCalendar } from "@/data/groupTours";
import { listDepartures } from "@/lib/groupStore";
import { GroupCalendar } from "@/components/groups/GroupCalendar";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Group trips and departure calendar | Boker Adventures",
  description:
    "Plan ahead with Boker’s group safari weekends, day hikes and mountain climbs. Explore departure dates, register your party and review a written group offer.",
  alternates: { canonical: "/groups" },
  openGraph: {
    title: "Find your next adventure together",
    description:
      "Safari weekends, guided day hikes, Mount Meru and Kilimanjaro group departures.",
    url: "/groups",
    images: ["/images/groups/meru.jpg"],
  },
};
export default async function GroupCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let departures = seedGroupCalendar(),
    available = true;
  try {
    departures = await listDepartures();
  } catch {
    available = false;
  }
  const kind =
    typeof params.kind === "string" &&
    ["safari", "hiking", "climbing", "culture", "special"].includes(params.kind)
      ? params.kind
      : "all";
  return (
    <>
      <section className="group-calendar-hero">
        <Image
          src={groupTemplates.find((t) => t.id === "mount-meru")!.image}
          alt="Mount Meru seen from Arusha"
          fill
          priority
          sizes="100vw"
        />
        <div className="group-hero-shade" />
        <div className="group-width">
          <p className="group-eyebrow">Boker · Adventures together</p>
          <h1>
            A date to look forward to.
            <br />
            <span>People to share it with.</span>
          </h1>
          <p>
            Safari weekends. Trails close to home. A mountain climb planned well
            ahead. Find your dates, bring a friend or join a new group.
          </p>
          <div className="group-hero-links">
            <a className="group-primary" href="#departure-calendar">
              Explore the departure calendar
            </a>
            <Link href="/groups?kind=climbing#departure-calendar">
              Find a mountain climb ↗
            </Link>
          </div>
          <div className="group-rhythm">
            <span>
              <b>12 months</b>planned ahead
            </span>
            <span>
              <b>Weekend escapes</b>hikes, parks and local hosts
            </span>
            <span>
              <b>Mountain series</b>Meru, Machame and Lemosho
            </span>
          </div>
        </div>
      </section>
      <div className="group-width">
        <div className="group-calendar-intro">
          <div>
            <p className="group-eyebrow">Choose your date. Join the group.</p>
            <h2>
              Small adventures now.
              <br />
              Bigger plans ahead.
            </h2>
          </div>
          <p>
            The calendar includes pre-planned dates collecting interest and
            departures open for place requests. Check each trip’s status.
            Prices, services and your booking are confirmed in a written offer.
          </p>
        </div>
        <GroupCalendar
          key={`${kind}-${params.package || ""}-${params.month || ""}`}
          departures={departures}
          templates={groupTemplates}
          initialKind={kind}
          initialPackage={
            typeof params.package === "string" ? params.package : ""
          }
          initialMonth={typeof params.month === "string" ? params.month : ""}
          available={available}
        />
        <p className="group-note">
          <a href="/api/groups/calendar" download>
            Download the departure calendar
          </a>
          {" · "}
          <Link href="/groups/credits">Photographs and credits</Link>
        </p>
      </div>
    </>
  );
}
