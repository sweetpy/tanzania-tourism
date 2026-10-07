import type { Metadata } from "next";
import { GroupDesk } from "@/components/groups/GroupDesk";
export const metadata: Metadata = {
  title: "Departure desk | Boker Adventures",
  robots: { index: false, follow: false },
};
export default function GroupDeskPage() {
  return <GroupDesk />;
}
