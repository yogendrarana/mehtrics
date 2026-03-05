import { auth } from "./src/server";
import { authClient } from "./src/client";

import { toNextJsHandler } from "better-auth/next-js";

/**
 * Get the current session from a request.
 * Returns null if not authenticated.
 */
export async function getSessionFromRequest(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

/**
 * Require authentication. Throws if session is invalid.
 * Use in Server Actions and Route Handlers.
 */
export async function requireSession(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require admin role.
 */
export async function requireAdmin(request: Request) {
  const session = await requireSession(request);
  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    throw new Error("Forbidden: admin only");
  }
  return session;
}

// exports
export { authClient, auth, toNextJsHandler };
