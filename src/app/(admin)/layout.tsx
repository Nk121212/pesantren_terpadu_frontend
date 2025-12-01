import LayoutClient from "./LayoutClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
