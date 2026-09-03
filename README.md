# ITZ-DONE TECH SOLUTION

A course marketplace built with Next.js, Convex, and Flutterwave.

## Getting Started

```bash
npm run dev
```

Open http://localhost:3000.

## Media architecture

Course media is intentionally split from Convex:

- **Cloudflare Stream** stores, processes, and privately streams lesson videos.
- **Cloudflare R2** stores PDFs, course images, thumbnails, and avatars.
- **Convex** stores media metadata and enforces ownership, enrollment, and lesson access.

There are no course assets to migrate. New uploads must use the media API routes; the legacy Convex upload functions in [`convex/files.ts`](convex/files.ts) are retained only for development compatibility and must not be used for new course content.

### Video protection model

Videos are never offered as downloadable MP4 files. Playback requires a short-lived Cloudflare Stream signed token, and the application checks enrollment or free-lesson access before issuing it. Browser playback cannot technically prevent screen recording or a determined user from capturing streamed bytes; signed playback is intended to prevent public links and casual sharing.

### Required media environment variables

Copy [`.env.example`](.env.example) to `.env.local` and configure:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_STREAM_API_TOKEN=...
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=...
CLOUDFLARE_STREAM_WEBHOOK_SECRET=...
CLOUDFLARE_STREAM_MAX_DURATION_SECONDS=7200
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
MEDIA_MUTATION_SECRET=...
```

`MEDIA_MUTATION_SECRET` protects the server-to-server Convex media mutations.
Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
set it in your hosting provider, and set the **same value** in the Convex deployment
environment (Dashboard → Settings → Environment Variables). If it is not set, the code
falls back to `CONVEX_MUTATION_SECRET`.

Keep all media credentials server-only. Do not prefix them with `NEXT_PUBLIC_`.

### Cloudflare setup (step by step)

**Cloudflare dashboard — Stream**

1. Create a Cloudflare Stream-enabled account.
2. Create a Stream API token with the minimum Stream upload/read/delete permissions used by this application. Put the token in `CLOUDFLARE_STREAM_API_TOKEN`.
3. Stream → your account subdomain → copy the customer subdomain value only into `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`.
4. Stream → Settings → Webhook: register `https://your-domain.example/api/webhooks/cloudflare-stream`.
5. Generate a signing secret and paste it into both the Stream webhook settings and `CLOUDFLARE_STREAM_WEBHOOK_SECRET`.
6. In the app upload-initiate call, signed URLs are always required and downloads are not exposed. Set the `maxDurationSeconds` policy through `CLOUDFLARE_STREAM_MAX_DURATION_SECONDS` (default 7200).

**Cloudflare dashboard — R2**

7. Create a private R2 bucket (e.g. `itzdone-media`), never make it public. Set `R2_BUCKET_NAME`.
8. R2 → Manage R2 API Tokens → create an S3 API token scoped to that bucket with object read/write (and delete where policy permits). Put the access key and secret in `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.
9. Configure bucket CORS so a browser can `PUT` directly to the presigned URL from your local and production origins, allowing `Content-Type` and the `x-amz-meta-mediaid` header. No `GET` CORS is needed because media is never fetched cross-origin by browser JS.
10. Leave `R2_PUBLIC_BASE_URL` unset. Public course thumbnails are delivered through the sessionless proxy endpoint `/api/media/:mediaId/thumbnail`, which issues short-lived signed R2 URLs per request without requiring a login. Private avatars are served through `/api/media/:mediaId/avatar` to the owner only.

### Media API flows

- `POST /api/media/video/upload-initiate` creates a Stream direct-upload session after instructor/course ownership checks.
- `POST /api/media/file/upload-initiate` creates an R2 presigned upload for a PDF, image, or avatar.
- `POST /api/media/file/complete` verifies the uploaded object with `HEAD`, including size and content type.
- `GET /api/media/:mediaId/access` authorizes either signed Stream playback or a short-lived R2 resource URL.
- `GET /api/media/:mediaId/thumbnail` redirects to a short-lived R2 URL for a public course image (no session required for marketplace browsing).
- `GET /api/media/:mediaId/avatar` redirects to a short-lived R2 URL for a private user avatar (owner or admin only).
- `DELETE /api/media` marks and removes an owned asset from its provider.
- `POST /api/webhooks/cloudflare-stream` updates processing status idempotently after signature validation.

Media status is separate from upload success: a Stream upload remains unavailable until processing reports `ready`.

### Product limits

The current server-side limits are defined in [`src/lib/media.ts`](src/lib/media.ts): avatars 5 MB, images 10 MB, PDFs 100 MB, and videos 5 GB. Review these limits against the selected Cloudflare plan before production launch.

## Payments and payouts

The platform uses Flutterwave for course payments and instructor payouts. Add the existing payment variables described below to `.env.local`:

```bash
FLUTTERWAVE_SECRET_KEY=...
FLUTTERWAVE_SECRET_HASH=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_USD_TO_NGN_RATE=1550
CONVEX_MUTATION_SECRET=...
```

Run `npx convex deploy` after Convex changes and configure all variables in both the hosting provider and Convex deployment where applicable.

## Production checklist

**Environment**

- Configure every variable in `.env.example`, including `MEDIA_MUTATION_SECRET` (or the shared `CONVEX_MUTATION_SECRET` fallback) in both Vercel and Convex.
- Keep Cloudflare credentials server-only. Never use `NEXT_PUBLIC_` for them.

**Cloudflare**

- Stream API token, customer subdomain, signed URL policy, webhook URL, and webhook signing secret are configured.
- R2 bucket is private, S3 API token is scoped, and CORS allows direct browser `PUT` from local and production origins.
- `R2_PUBLIC_BASE_URL` is unset.

**Application tests**

- Instructor creates a course and uploads a thumbnail; the thumbnail renders on the public course listing and detail pages without a login.
- Instructor uploads a PDF resource; it is listed and downloadable only after the upload completes.
- Instructor uploads a lesson video in the lesson editor; it transitions through `processing` to `ready` via the Stream webhook, and the lesson can then be saved with the video attached.
- An enrolled learner can play a paid lesson through the signed HLS player.
- An unenrolled learner receives no playback token and no direct video URL.
- A logged-out visitor cannot access a private avatar via `/api/media/:id/avatar`.
- A direct Stream URL without a signed token fails.
- PDF access is denied without entitlement and uses a short-lived URL when authorized.
- Re-sending a duplicate Stream webhook is harmless (idempotent).
- No legacy Convex file-upload mutation is used for new course content.

**Monitoring**

- Track Stream minutes, R2 storage and operations, upload failures, video processing latency, playback authorization failures, and webhook retries.
- Alert on upload-initiation failures, webhook signature rejections, processing failures, and orphaned asset counts above an agreed threshold.

## Deploy on Vercel

Set all environment variables in Vercel, deploy the application, and run `npx convex deploy` for the production Convex deployment. Ensure the production webhook URL and application origins are configured in Cloudflare.
