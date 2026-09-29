import type { BandRate, RateMatrix } from './api';

/**
 * Reading the rate table the main site publishes.
 *
 * Pure lookups, no engine. The main site computes the table from its lender
 * catalogue and serves it at /api/rates — fifteen rows — and this file picks
 * the row for a score. That is what lets the slider respond instantly while
 * still showing the live catalogue's numbers, without a copy of the rules
 * engine living in a second repository where it would drift.
 */

export type LoanKey = 'home' | 'lap' | 'personal' | 'business';

/**
 * Which key the rate table has a product for.
 *
 * A loan against property is on this page because we arrange it, and it is not
 * priced in the catalogue — a LAP is quoted against the property. So it has no
 * row, and everything that would otherwise invent a number for it returns null
 * instead. A landing page with a made-up rate on it is worse than a landing
 * page with one fewer number.
 */
export const PRICED: Record<LoanKey, 'home' | 'personal' | 'business' | null> = {
  home: 'home',
  lap: null,
  personal: 'personal',
  business: 'business',
};

export const SCORE_MIN = 600;
export const SCORE_MAX = 900;

/** The row covering this score, or null when the product is not priced. */
export function bandFor(matrix: RateMatrix | null, key: LoanKey, score: number): BandRate | null {
  const product = PRICED[key];
  if (!matrix || !product) return null;
  const rates = matrix.products[product];
  if (!rates) return null;
  // Bands arrive ordered high to low and end at 0, so a match always exists.
  return rates.bands.find((band) => score >= band.min) ?? null;
}

/** How many lenders the panel holds for this product — the denominator. */
export function totalFor(matrix: RateMatrix | null, key: LoanKey): number {
  const product = PRICED[key];
  if (!matrix || !product) return 0;
  return matrix.products[product]?.total ?? 0;
}

/** The "rates from" line under a product tab. Null when nothing is priced. */
export function rateFrom(matrix: RateMatrix | null, key: LoanKey): number | null {
  const product = PRICED[key];
  if (!matrix || !product) return null;
  return matrix.products[product]?.from ?? null;
}

/** One decimal, or two — however many the number actually needs. */
export function showRate(rate: number): string {
  return rate.toFixed(2).replace(/\.?0+$/, '');
}

/** The band label the form's own CIBIL select uses, so the two agree. */
export function formBandOf(score: number): string {
  if (score >= 800) return '800+';
  if (score >= 750) return '750–799';
  if (score >= 700) return '700–749';
  if (score >= 650) return '650–699';
  return 'Below 650';
}
