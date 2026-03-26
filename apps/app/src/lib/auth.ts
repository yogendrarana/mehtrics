import { headers } from "next/headers";
import { getSessionFromRequest } from "@mehtrics/auth";

/**
 * Get the current session using the headers from the current request.
 * Works in Server Components, Server Actions, and Route Handlers.
 */
export async function getSession() {
  const h = await headers();
  return getSessionFromRequest({ headers: new Headers(h) } as Request);
}

/**
 * Get user from session.
 */
export async function getUserFromSession() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Get the user ID specifically from the 'x-user-id' header.
 * This header is set by the proxy (apps/web/src/proxy.ts).
 */
export async function getUserIdFromHeader() {
  const h = await headers();
  return h.get("x-user-id");
}

/**
 * Get the user ID, check the header first (set by proxy), then the session.
 */
export async function getUserId() {
  const headerId = await getUserIdFromHeader();
  if (headerId) return headerId;

  const user = await getUserFromSession();
  return user?.id ?? null;
}

/**
 * Get user ID from a specific Request object.
 * Useful for Route Handlers, Middleware, or any function where Request is available.
 */
export async function getUserIdFromRequest(request: Request) {
  const headerId = request.headers.get("x-user-id");
  if (headerId) return headerId;

  const session = await getSessionFromRequest(request);
  return session?.user?.id ?? null;
}
