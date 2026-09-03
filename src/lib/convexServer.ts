import "server-only";

import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

export function getConvexServerClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  client ??= new ConvexHttpClient(url);
  return client;
}

export function getMediaMutationSecret() {
  const secret = process.env.MEDIA_MUTATION_SECRET ?? process.env.CONVEX_MUTATION_SECRET;
  if (!secret) throw new Error("MEDIA_MUTATION_SECRET or CONVEX_MUTATION_SECRET is not configured");
  return secret;
}

export function getProviderIdFromSession(session: { user?: { id?: string | null } } | null) {
  const providerId = session?.user?.id;
  if (!providerId) throw new Error("Unauthorized");
  return providerId;
}
