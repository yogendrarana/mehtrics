import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@mehtrics/db";
import { db } from "@mehtrics/db/client";
import { serverEnv } from "@mehtrics/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // Session config
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache for 5 minutes to reduce DB lookups
    },
  },

  // Cookie configuration — httpOnly by default in better-auth
  advanced: {
    cookiePrefix: "mehtrics",
  },

  // User fields beyond better-auth defaults
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
