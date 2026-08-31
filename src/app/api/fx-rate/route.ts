import { NextResponse } from "next/server";

/**
 * Live USD → NGN exchange rate.
 *
 * Uses ExchangeRate-API's free open endpoint (no API key required,
 * refreshed daily). The response is cached by Next.js for 6 hours, so
 * we make at most ~4 upstream requests per day regardless of traffic.
 *
 * Fallback chain: live API → NEXT_PUBLIC_USD_TO_NGN_RATE env var → 1550.
 */

const FALLBACK_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) || 1550;
const CACHE_SECONDS = 6 * 60 * 60; // 6 hours

interface OpenErApiResponense {
  result: string;
  rates?: Record<string, number>;
}

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: CACHE_SECONDS },
    });

    if (res.ok) {
      const data = (await res.json()) as OpenErApiResponense;
      const ngn = data.rates?.NGN;
      if (typeof ngn === "number" && ngn > 0) {
        return NextResponse.json(
          { rate: Math.round(ngn * 100) / 100, source: "live", base: "USD", quote: "NGN" },
          { headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400` } }
        );
      }
    }
  } catch (error) {
    console.warn("[fx-rate] Live rate fetch failed, using fallback:", error);
  }

  return NextResponse.json(
    { rate: FALLBACK_RATE, source: "fallback", base: "USD", quote: "NGN" },
    { headers: { "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400` } }
  );
}
