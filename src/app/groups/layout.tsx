import "./groups.css";
export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="group-pages">{children}</div>;
}
