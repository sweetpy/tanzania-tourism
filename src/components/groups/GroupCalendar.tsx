"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Heart,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Departure, GroupTemplate } from "@/lib/groupTypes";
import { todayInTanzania, formatGroupDate } from "@/lib/groupPolicy";
import { GroupCard } from "./GroupCommon";
type Props = {
  departures: Departure[];
  templates: GroupTemplate[];
  initialKind?: string;
  initialPackage?: string;
  initialMonth?: string;
  available: boolean;
};
export function GroupCalendar({
  departures,
  templates,
  initialKind = "all",
  initialPackage = "",
  initialMonth = "",
  available,
}: Props) {
  const today = todayInTanzania(),
    [kind, setKind] = useState(initialKind),
    [town, setTown] = useState("all"),
    [search, setSearch] = useState(""),
    [weekend, setWeekend] = useState(false),
    [savedOnly, setSavedOnly] = useState(false),
    [saved, setSaved] = useState<string[]>([]),
    [view, setView] = useState<"list" | "calendar">(
      initialMonth ? "calendar" : "list",
    ),
    [month, setMonth] = useState(
      /^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : today.slice(0, 7),
    ),
    [selectedDay, setSelectedDay] = useState("");
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("boker-group-shortlist-v1") || "[]",
      );
      if (Array.isArray(stored))
        queueMicrotask(() =>
          setSaved(stored.filter((v) => typeof v === "string").slice(0, 100)),
        );
    } catch {}
  }, []);
  function save(id: string) {
    const next = saved.includes(id)
      ? saved.filter((v) => v !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("boker-group-shortlist-v1", JSON.stringify(next));
    } catch {}
  }
  const templateMap = useMemo(
    () => new Map(templates.map((t) => [t.id, t])),
    [templates],
  );
  const filtered = departures.filter((d) => {
    const t = templateMap.get(d.templateId);
    return (
      t &&
      d.status !== "cancelled" &&
      d.startDate >= today &&
      (kind === "all" ||
        (kind === "special"
          ? d.id.startsWith("seasonal-")
          : t.kind === kind)) &&
      (town === "all" || t.town === town) &&
      (!initialPackage || t.packageSlug === initialPackage) &&
      (!savedOnly || saved.includes(d.id)) &&
      (!weekend ||
        (t.days <= 3 &&
          [5, 6, 0].includes(
            new Date(d.startDate + "T12:00:00Z").getUTCDay(),
          ))) &&
      `${d.title} ${t.summary} ${t.town}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });
  const months = Array.from({ length: 25 }, (_, n) => {
    const d = new Date(today.slice(0, 7) + "-01T12:00:00Z");
    d.setUTCMonth(d.getUTCMonth() + n);
    return d.toISOString().slice(0, 7);
  });
  const monthName = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value + "-01T12:00:00Z"));
  const monthEnd = new Date(
    Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0),
  )
    .toISOString()
    .slice(0, 10);
  const visible =
    view === "calendar"
      ? filtered.filter(
          (d) =>
            d.startDate <= monthEnd &&
            d.endDate >= month + "-01" &&
            (!selectedDay ||
              (d.startDate <= selectedDay && d.endDate >= selectedDay)),
        )
      : filtered;
  const first = new Date(month + "-01T12:00:00Z"),
    padding = (first.getUTCDay() + 6) % 7,
    last = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate();
  function changeMonth(value: string) {
    setMonth(value);
    setSelectedDay("");
  }
  function clear() {
    setKind("all");
    setTown("all");
    setSearch("");
    setWeekend(false);
    setSavedOnly(false);
    setSelectedDay("");
  }
  return (
    <div className="group-explorer" id="departure-calendar">
      {!available && (
        <p className="group-notice" role="status">
          The calendar is available to explore. Registration is temporarily
          unavailable; <Link href="/enquire">contact the team</Link> about a
          date.
        </p>
      )}
      <div className="group-filter-bar">
        <label className="group-search">
          <Search size={18} />
          <span className="sr-only">Search group trips</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="A mountain, a park, a weekend…"
          />
        </label>
        <label>
          Trip type
          <select
            aria-label="Trip type"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setSelectedDay("");
            }}
          >
            <option value="all">All adventures</option>
            <option value="hiking">Day hikes and nature walks</option>
            <option value="climbing">Mountain climbs</option>
            <option value="safari">Safaris</option>
            <option value="culture">Community and culture</option>
            <option value="special">Special outings</option>
          </select>
        </label>
        <label>
          Starting town
          <select
            aria-label="Starting town"
            value={town}
            onChange={(e) => setTown(e.target.value)}
          >
            <option value="all">Arusha and Moshi</option>{" "}
            <option>Arusha</option>
            <option>Moshi</option>
          </select>
        </label>
      </div>
      {initialPackage && (
        <p className="group-notice">
          Showing departures for this package.{" "}
          <Link href="/groups">Explore the full calendar</Link>.
        </p>
      )}
      <div className="group-view-bar">
        <div className="group-filter-toggles">
          <button aria-pressed={weekend} onClick={() => setWeekend(!weekend)}>
            Short weekend trips
          </button>
          <button
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(!savedOnly)}
          >
            <Heart size={15} />
            Saved ({saved.length})
          </button>
          {(kind !== "all" ||
            town !== "all" ||
            search ||
            weekend ||
            savedOnly) && (
            <button onClick={clear}>
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>
        <div className="group-view-tabs" aria-label="Calendar view">
          <button
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={17} />
            Upcoming
          </button>
          <button
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays size={17} />
            Calendar
          </button>
        </div>
      </div>
      {view === "calendar" && (
        <div className="group-calendar-panel">
          <div className="group-month-controls">
            <button
              aria-label="Previous month"
              disabled={months.indexOf(month) <= 0}
              onClick={() =>
                changeMonth(months[Math.max(0, months.indexOf(month) - 1)])
              }
            >
              <ChevronLeft />
            </button>
            <label>
              <span className="sr-only">Calendar month</span>
              <select
                aria-label="Calendar month"
                value={month}
                onChange={(e) => changeMonth(e.target.value)}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthName(m)}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label="Next month"
              disabled={months.indexOf(month) >= months.length - 1}
              onClick={() => changeMonth(months[months.indexOf(month) + 1])}
            >
              <ChevronRight />
            </button>
          </div>
          <div
            className="group-month-grid"
            aria-label={`${monthName(month)} departures`}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div className="group-weekday" key={day}>
                {day}
              </div>
            ))}
            {Array.from({ length: padding }, (_, n) => (
              <div className="group-empty-day" key={`blank${n}`} />
            ))}
            {Array.from({ length: last }, (_, n) => {
              const date = `${month}-${String(n + 1).padStart(2, "0")}`,
                events = filtered.filter(
                  (d) => d.startDate <= date && d.endDate >= date,
                );
              return (
                <button
                  key={date}
                  className={`group-calendar-day ${selectedDay === date ? "selected" : ""} ${date === today ? "today" : ""}`}
                  disabled={!events.length}
                  onClick={() =>
                    setSelectedDay(selectedDay === date ? "" : date)
                  }
                  aria-label={`${formatGroupDate(date)}: ${events.length} ${events.length === 1 ? "trip" : "trips"}`}
                  aria-pressed={selectedDay === date}
                >
                  <span>{n + 1}</span>
                  {events.slice(0, 2).map((d) => (
                    <small
                      key={d.id}
                      className={`kind-${templateMap.get(d.templateId)?.kind}`}
                    >
                      {d.title}
                    </small>
                  ))}
                  {events.length > 2 && (
                    <small>+{events.length - 2} more</small>
                  )}
                  <i>
                    {events.length
                      ? `${events.length} ${events.length === 1 ? "trip" : "trips"}`
                      : ""}
                  </i>
                </button>
              );
            })}
          </div>
          <p className="group-small">
            Tap a highlighted date to see trips running that day. Multi-day
            journeys appear across their full dates.
          </p>
          {selectedDay && (
            <button
              className="group-text-link"
              onClick={() => setSelectedDay("")}
            >
              Show the whole month
            </button>
          )}
        </div>
      )}
      <div className="group-results-heading">
        <h2>
          {view === "calendar"
            ? selectedDay
              ? `Travelling on ${formatGroupDate(selectedDay)}`
              : monthName(month)
            : "Find your next group adventure"}
        </h2>
        <p aria-live="polite">
          {visible.length} {visible.length === 1 ? "departure" : "departures"}
        </p>
      </div>
      {!visible.length ? (
        <div className="group-empty">
          <CalendarDays size={30} />
          <h3>No matching departures here yet.</h3>
          <p>
            Try another month or trip type. We can also arrange a private trip
            for your own dates.
          </p>
          <button className="group-primary" onClick={clear}>
            Reset filters
          </button>
          <Link href="/plan">Build a private itinerary</Link>
        </div>
      ) : (
        <div className="group-trip-grid">
          {visible.map((d, index) => (
            <div key={d.id}>
              {view === "list" &&
                (index === 0 ||
                  visible[index - 1].startDate.slice(0, 7) !==
                    d.startDate.slice(0, 7)) && (
                  <p className="group-list-month">
                    {monthName(d.startDate.slice(0, 7))}
                  </p>
                )}
              <GroupCard
                departure={d}
                template={templateMap.get(d.templateId)!}
                saved={saved.includes(d.id)}
                onSave={() => save(d.id)}
              />
            </div>
          ))}
        </div>
      )}
      <section className="group-how">
        <h2>A date in your diary. A trip confirmed with care.</h2>
        <div>
          <article>
            <b>01</b>
            <h3>Choose your departure</h3>
            <p>
              Explore the programme, dates and starting town. Save a shortlist
              or share the trip with friends.
            </p>
          </article>
          <article>
            <b>02</b>
            <h3>Register your party</h3>
            <p>
              Join the interest list for a proposed trip, request places on an
              open departure or opt into its waitlist.
            </p>
          </article>
          <article>
            <b>03</b>
            <h3>Review your offer</h3>
            <p>
              The team confirms services and your party’s price. Accept the
              written offer, then follow verified booking instructions.
            </p>
          </article>
          <article>
            <b>04</b>
            <h3>Get ready together</h3>
            <p>
              Your private trip page shows your status. A booking is confirmed
              after the team checks the agreed payment or authorisation.
            </p>
          </article>
        </div>
      </section>
      <section className="group-private">
        <h2>Your own dates, your own people?</h2>
        <p>
          For a family, club, school or company, start with a private itinerary.
          Tell us your group size and what you have in mind.
        </p>
        <Link className="group-primary" href="/plan">
          Plan a private group trip
        </Link>
      </section>
    </div>
  );
}
