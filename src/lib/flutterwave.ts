/**
 * Shared Flutterwave helpers for server-side API routes.
 * Docs: https://developer.flutterwave.com/docs
 */

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

export function getFlutterwaveSecret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  }
  return key;
}

/**
 * Shared secret for server-to-server Convex mutations (payment completion,
 * payout processing). Must match CONVEX_MUTATION_SECRET in the Convex
 * deployment's environment variables.
 */
export function getConvexMutationSecret(): string {
  const secret = process.env.CONVEX_MUTATION_SECRET;
  if (!secret) {
    throw new Error("CONVEX_MUTATION_SECRET is not configured");
  }
  return secret;
}

export function getAppBaseUrl(): string {
  // Explicit override for prod, fallback to Vercel URL, then localhost
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/**
 * Generate a unique transaction reference, e.g. ITZDONE-8F3K2A-1725100000000
 */
export function generateTxRef(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ITZDONE-${random}-${Date.now()}`;
}

/**
 * Verify Flutterwave's webhook signature:
 * SHA-256 of (rawBody + secret hash) must equal the "verif-hash" header.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secretHash || !signature) return false;

  const crypto = await import("crypto");
  const expected = crypto
    .createHash("sha256")
    .update(rawBody + secretHash)
    .digest("hex");
  return expected === signature;
}

interface FlutterwaveResponse<T> {
  status: string;
  message: string;
  data: T;
}

async function flutterwaveFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<FlutterwaveResponse<T>> {
  const res = await fetch(`${FLUTTERWAVE_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getFlutterwaveSecret()}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.message ?? `Flutterwave API error (${res.status})`);
  }
  return json as FlutterwaveResponse<T>;
}

// ─── Standard Payment (hosted checkout) ──────────────────────────────────

export interface InitiatePaymentArgs {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name: string; phone?: string };
  meta?: Record<string, unknown>;
  customizations?: { title: string; description: string; logo?: string };
}

export async function initiateFlutterwavePayment(args: InitiatePaymentArgs) {
  return flutterwaveFetch<{ link: string }>("/payments", {
    method: "POST",
    body: args,
  });
}

// ─── Transaction verification ────────────────────────────────────────────

export interface VerifiedTransaction {
  id: number;
  tx_ref: string;
  status: string; // "successful" | "failed" | "cancelled"
  currency: string;
  amount: number;
  amount_settled: number;
  payment_type?: string;
  customer?: { email?: string; name?: string };
}

export async function verifyFlutterwaveTransaction(transactionId: number) {
  return flutterwaveFetch<VerifiedTransaction>(`/transactions/${transactionId}/verify`);
}

// ─── Banks & account resolution (payouts) ────────────────────────────────

export interface NigerianBank {
  code: string;
  name: string;
  longcode: string;
}

export async function listNigerianBanks() {
  return flutterwaveFetch<NigerianBank[]>("/banks/NG");
}

export async function resolveBankAccount(accountNumber: string, bankCode: string) {
  return flutterwaveFetch<{ account_number: string; account_name: string }>(
    `/accounts/resolve?account_number=${encodeURIComponent(accountNumber)}&account_bank=${encodeURIComponent(bankCode)}`
  );
}

// ─── Transfers (payouts to instructors) ──────────────────────────────────

export interface TransferResult {
  id: number;
  amount: number;
  status: string;
  reference: string;
}

export async function createFlutterwaveTransfer(args: {
  accountBank: string;
  accountNumber: string;
  amount: number;
  narration: string;
  currency: string;
  reference: string;
  callbackUrl: string;
}) {
  return flutterwaveFetch<TransferResult>("/transfers", {
    method: "POST",
    body: args,
  });
}

export async function retryFlutterwaveTransfer(transferId: number) {
  return flutterwaveFetch<TransferResult>(`/transfers/${transferId}/retry`, {
    method: "POST",
  });
}
