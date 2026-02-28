import { type NextRequest, NextResponse } from "next/server";

// We use cookie-based session checking instead of full auth objects
// to keep the middleware lightweight and Edge-compatible.
const SESSION_COOKIE = "mehtrics.session_token"; // better-auth session cookie

const PUBLIC_PATHS = [
  "/login",
  "/setup",
  "/api/track",
  "/api/auth",
  "/api/health",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // To check if a session exists in Edge without DB,
  // we check for the session cookie or use Better Auth's lightness where possible.
  // For now, if no session cookie, redirect to login.
  const sessionToken = request.cookies.get(SESSION_COOKIE);

  if (!sessionToken?.value && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|tracker.js).*)"],
};
