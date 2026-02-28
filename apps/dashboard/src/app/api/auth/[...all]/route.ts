import { auth } from "@mehtrics/auth";
import { toNextJsHandler } from "@mehtrics/auth";

// better-auth route handler
// Handles: POST /api/auth/sign-in/email, POST /api/auth/sign-up/email,
//          POST /api/auth/sign-out, GET /api/auth/session, etc.
export const { GET, POST } = toNextJsHandler(auth);
