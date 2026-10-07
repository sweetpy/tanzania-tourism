import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Departure desk | Boker Adventures",
  robots: { index: false, follow: false },
};
export default function GroupDeskPage() {
  redirect("https://www.pin.co.tz/admin?tab=bokergroups");
}
