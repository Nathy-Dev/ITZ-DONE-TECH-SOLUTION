/**
 * Formats a number as a currency string.
 * @param amount The numerical amount to format.
 * @param currency The currency code (e.g., 'NGN', 'USD'). Defaults to 'NGN'.
 * @returns A formatted currency string.
 */
export function formatPrice(amount: number, currency: string = "NGN"): string {
  // We use Naira (₦) for NGN and Dollar ($) for USD
  // In the future, this can be expanded to use Intl.NumberFormat for full localization support
  
  if (currency === "NGN") {
    // Standard Naira symbol
    return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * The platform's settlement currency is NGN (all Flutterwave charges and
 * payouts are processed in Naira). USD is shown only as a reference
 * equivalent so international students understand the price.
 *
 * The live rate comes from /api/fx-rate (ExchangeRate-API's free
 * daily-updated feed). This env value is only the fallback.
 */
export const USD_TO_NGN_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_NGN_RATE) || 1550;

/**
 * Convert an NGN amount to its approximate USD equivalent.
 * Pass a live rate when available (from the useFxRate hook).
 */
export function ngnToUsd(amountNgn: number, rate: number = USD_TO_NGN_RATE): number {
  return Math.round((amountNgn / rate) * 100) / 100;
}

/**
 * Format an NGN amount with its approximate USD equivalent, e.g.
 * "₦25,000 (~$16.13)". Falls back to NGN-only when the amount is 0.
 */
export function formatPriceWithUsd(amountNgn: number, rate: number = USD_TO_NGN_RATE): string {
  if (!amountNgn || amountNgn <= 0) return formatPrice(0);
  return `${formatPrice(amountNgn)} (~${formatPrice(ngnToUsd(amountNgn, rate), "USD")})`;
}
