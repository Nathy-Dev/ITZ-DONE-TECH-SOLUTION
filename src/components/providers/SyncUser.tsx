"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { FunctionReference } from "convex/server";

/**
 * SyncUser component.
 * Automatically syncs the Auth.js session with the Convex database.
 */
export function SyncUser() {
  const { data: session } = useSession();
  
  // Use a fallback to avoid crashing during build if api.users is undefined
  const syncUser = useMutation(
    (api?.users?.createOrUpdateUser as FunctionReference<"mutation">) ?? null
  );

  useEffect(() => {
    // Only run on the client and if session is available
    if (typeof window === "undefined" || !session?.user?.id || !syncUser) return;

    syncUser({
      providerId: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      profileImage: session.user.image ?? undefined,
    }).catch((err) => {
      console.error("Failed to sync user with Convex:", err);
    });
  }, [session, syncUser]);

  return null;
}
