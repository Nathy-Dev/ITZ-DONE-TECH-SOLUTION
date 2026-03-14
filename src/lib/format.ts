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
