"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no Clerk key is found (e.g. during build/prerendering), 
  // we skip the auth wrapping to prevent "Missing publishableKey" errors.
  if (!clerkKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      ) : (
        <>{children}</>
      )}
    </ClerkProvider>
  );
}
