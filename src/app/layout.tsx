import "./globals.css";
import { SidebarProvider } from "@/lib/sidebar-context";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
