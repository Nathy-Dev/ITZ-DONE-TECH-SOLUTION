import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

const MAX_AGE_SECONDS = 900;

export const MEDIA_KINDS = ["video", "document", "image", "avatar"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MAX_FILE_BYTES: Record<MediaKind, number> = {
  avatar: 5 * 1024 * 1024,
  image: 10 * 1024 * 1024,
  document: 100 * 1024 * 1024,
  video: 5 * 1024 * 1024 * 1024,
};

export const ALLOWED_MIME_TYPES: Record<MediaKind, readonly string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  image: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"],
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getR2Config() {
  const accountId = requiredEnv("CLOUDFLARE_ACCOUNT_ID");
  return {
    accountId,
    bucket: requiredEnv("R2_BUCKET_NAME"),
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || null,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
      },
    }),
  };
}

export function getStreamConfig() {
  return {
    accountId: requiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    apiToken: requiredEnv("CLOUDFLARE_STREAM_API_TOKEN"),
    customerSubdomain: requiredEnv("CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN"),
    webhookSecret: process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET || null,
  };
}

export function validateMediaInput(kind: MediaKind, mimeType: string, sizeBytes: number) {
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) throw new Error("A valid file size is required");
  if (!ALLOWED_MIME_TYPES[kind].includes(mimeType.toLowerCase())) throw new Error(`Unsupported ${kind} file type`);
  if (sizeBytes > MAX_FILE_BYTES[kind]) throw new Error(`File exceeds the ${Math.round(MAX_FILE_BYTES[kind] / 1024 / 1024)} MB limit`);
}

export function getFileExtension(name: string, mimeType: string) {
  const fromName = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && fromName.length <= 8) return fromName;
  const fromMime = mimeType.split("/")[1]?.split(";")[0];
  return fromMime === "jpeg" ? "jpg" : fromMime || "bin";
}

export function createObjectKey(kind: MediaKind, id: string, name: string, mimeType: string) {
  const extension = getFileExtension(name, mimeType);
  const prefix = kind === "avatar" ? "avatars" : kind === "image" ? "images" : "resources";
  return `${prefix}/${id}.${extension}`;
}

export function getStreamPlaybackUrl(uid: string, token?: string) {
  const { customerSubdomain } = getStreamConfig();
  const base = `https://customer-${customerSubdomain}.cloudflarestream.com/${encodeURIComponent(uid)}/manifest/video.m3u8`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export function clampExpiry(seconds = 300) {
  return Math.min(Math.max(Math.floor(seconds), 60), MAX_AGE_SECONDS);
}

export function safeContentDisposition(name: string) {
  const safe = name.replace(/[\r\n"\\]/g, "_").slice(0, 180) || "download";
  return `attachment; filename="${safe}"`;
}
