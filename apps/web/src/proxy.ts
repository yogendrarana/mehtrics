import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@mehtrics/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/billing")) {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      const loginUrl = new URL("/signin", request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        request.nextUrl.pathname + request.nextUrl.search,
      );

      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
