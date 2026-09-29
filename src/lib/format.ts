/**
 * Rupees, the way Indian readers group them.
 *
 * A copy of the one function this page needs from the main site rather than a
 * dependency on it: en-IN grouping is a property of the language, not of the
 * business, and it will not change under us.
 */
export function formatINR(amount: number, opts: { decimals?: number } = {}): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  })}`;
}
