import { type NextRequest, NextResponse } from "next/server";
import { db, users, count, eq } from "@mehtrics/db";
import { auth } from "@mehtrics/auth";
import { z } from "zod";

// POST /api/setup
// Creates the first admin user. Permanently disabled after one user exists.

const setupSchema = z.object({
  name: z.string().min(1).max(128),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  // Check if users already exist — if so, this endpoint is disabled
  const [result] = await db.select({ value: count() }).from(users).limit(1);
  if ((result?.value ?? 0) > 0) {
    return NextResponse.json(
      { error: "Setup already completed. This endpoint is disabled." },
      { status: 403 },
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = setupSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { name, email, password } = parsed.data;

  // Use better-auth to create the user with proper hashing
  const signUpResult = await auth.api.signUpEmail({
    body: { name, email, password },
    headers: request.headers,
  });

  if (!signUpResult || "error" in (signUpResult as object)) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }

  // Promote to admin — at this point only one user exists (the one just created)
  // We use a subquery to get the email we just signed up with
  await db.update(users).set({ role: "admin" }).where(eq(users.email, email));

  return NextResponse.json({ ok: true }, { status: 201 });
}
