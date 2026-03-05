"use server";

import { db, eq, setting, user } from "@mehtrics/db";
import { auth } from "@mehtrics/auth";
import { headers } from "next/headers";

/**
 * Update the user's theme mode (light or dark).
 */
export async function updateMode(data: {
  userId: string;
  theme: "dark" | "light";
}) {
  if (!data.userId || !data.theme) {
    return { success: false, message: "User id or data not provided" };
  }

  const { userId, theme } = data;

  try {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
    if (!existingUser) {
      return { success: false, message: "User not available!" };
    }

    const preference = await db
      .select()
      .from(setting)
      .where(eq(setting.userId, userId))
      .limit(1)
      .then((res) => res[0]);

    if (!preference) {
      // If no settings exist yet, create them
      await db.insert(setting).values({
        id: crypto.randomUUID(),
        userId,
        appearanceSettings: {
          theme,
        },
      });
    } else {
      // Update existing settings
      await db
        .update(setting)
        .set({
          appearanceSettings: {
            ...((preference.appearanceSettings as any) ?? {}),
            theme,
          },
        })
        .where(eq(setting.userId, userId));
    }

    return { success: true, message: `Set the theme to ${theme}` };
  } catch (error: any) {
    console.error("Error updating mode:", error);
    return {
      success: false,
      message: error.message || "Failed to update theme mode",
    };
  }
}

/**
 * Get the current user's preferences.
 */
export async function getUserPreference() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Unauthorized" };
    }

    const preference = await db
      .select()
      .from(setting)
      .where(eq(setting.userId, session.user.id))
      .limit(1)
      .then((res) => res[0]);

    return {
      success: true,
      message: "Fetched user preference successfully!",
      data: preference,
    };
  } catch (error: any) {
    console.error("Error fetching user preferences:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch preferences",
    };
  }
}
