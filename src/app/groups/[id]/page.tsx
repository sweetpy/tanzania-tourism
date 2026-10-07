import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGroupTemplate, seedGroupCalendar } from "@/data/groupTours";
import { getDeparture } from "@/lib/groupStore";
import { GroupTrip } from "@/components/groups/GroupTrip";
import { formatGroupDate } from "@/lib/groupPolicy";
export const dynamic = "force-dynamic";
async function load(id: string) {
  try {
    return { departure: await getDeparture(id), available: true };
  } catch {
    return {
      departure: seedGroupCalendar().find((d) => d.id === id),
      available: false,
    };
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params,
    { departure: d } = await load(id),
    t = d && getGroupTemplate(d.templateId);
  return d && t
    ? {
        title: `${d.title} | ${formatGroupDate(d.startDate)} | Boker`,
        description: `${t.summary} ${d.status === "proposed" ? "Proposed group date; register early interest." : "Request places and review your party’s written offer."}`,
        alternates: { canonical: `/groups/${id}` },
        openGraph: {
          title: d.title,
          description: `${formatGroupDate(d.startDate, d.endDate)} · From ${t.town}. ${d.status === "proposed" ? "Proposed date; group price to be confirmed." : "Explore the group programme and request places."}`,
          images: [t.image],
          url: `/groups/${id}`,
        },
      }
    : { title: "Departure not found | Boker" };
}
export default async function GroupDeparturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    { departure, available } = await load(id),
    template = departure && getGroupTemplate(departure.templateId);
  if (!departure || !template) notFound();
  return (
    <GroupTrip
      departure={departure}
      template={template}
      available={available}
    />
  );
}
