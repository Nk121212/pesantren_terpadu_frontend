import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value || req.headers.get("Authorization");

  const protectedRoutes = ["/dashboard", "/users", "/invoices"];

  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/invoices/:path*"],
};
