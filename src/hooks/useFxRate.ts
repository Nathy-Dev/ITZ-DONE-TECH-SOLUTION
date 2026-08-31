"use client";

import { useEffect, useState } from "react";

/**
 * Live USD → NGN exchange rate hook.
 *
 * Fetches from our cached /api/fx-rate endpoint (which proxies
 * ExchangeRate-API's free daily-updated feed). Falls back to the
 * NEXT_PUBLIC_USD_TO_NGN_RATE env value while loading or on failure.
 *
 * The rate is cached in module scope so navigating between pages
 * triggers at most one request per session.
 */

const FALLBACK_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) || 1550;

let cachedRate: number | null = null;
let fetchPromise: Promise<number> | null = null;

async function fetchRate(): Promise<number> {
  if (cachedRate !== null) return cachedRate;
  if (!fetchPromise) {
    fetchPromise = fetch("/api/fx-rate")
      .then((res) => res.json())
      .then((data) => {
        const rate = typeof data?.rate === "number" && data.rate > 0 ? data.rate : FALLBACK_RATE;
        cachedRate = rate;
        return rate;
      })
      .catch(() => FALLBACK_RATE)
      .finally(() => {
        fetchPromise = null;
      });
  }
  return fetchPromise;
}

export function useFxRate(): number {
  const [rate, setRate] = useState<number>(cachedRate ?? FALLBACK_RATE);

  useEffect(() => {
    if (cachedRate !== null) return;
    let cancelled = false;
    fetchRate().then((r) => {
      if (!cancelled && r !== rate) setRate(r);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return rate;
}
