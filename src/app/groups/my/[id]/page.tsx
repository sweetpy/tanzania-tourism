import type { Metadata } from "next";
import { MyGroupTrip } from "@/components/groups/MyGroupTrip";
export const metadata: Metadata = {
  title: "My private group trip | Boker Adventures",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function MyGroupTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MyGroupTrip id={id} />;
}
