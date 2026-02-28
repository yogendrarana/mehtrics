import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mehtrics/db/client";
import * as schema from "@mehtrics/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Session config
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache for 5 minutes to reduce DB lookups
    },
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  // Cookie configuration — httpOnly by default in better-auth
  advanced: {
    generateId: () => crypto.randomUUID(),
    cookiePrefix: "mehtrics",
  },

  // User fields beyond better-auth defaults
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false, // Cannot be set by client
      },
    },
  },

  trustedOrigins: [
    process.env["BETTER_AUTH_URL"] ?? "http://localhost:3001",
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3001",
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
