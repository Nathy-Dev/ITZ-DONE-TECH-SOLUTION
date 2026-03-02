"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import bcrypt from "bcryptjs";

/**
 * Registers a new user with email and password.
 */
export async function registerUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return { error: "Configuration error: NEXT_PUBLIC_CONVEX_URL is missing" };
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await convex.mutation(api.users.registerUser, {
      name,
      email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Failed to register user" };
  }
}
