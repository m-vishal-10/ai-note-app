import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Only protect static assets from being matched
  const isAuthRoute =
    url.pathname === "/login" || url.pathname === "/sign-up";

  // You can still check cookies manually (if needed)
  const hasSession = request.cookies.get("sb-access-token");

  if (isAuthRoute && hasSession) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
