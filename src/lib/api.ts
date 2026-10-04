/**
 * Everything this app needs from the business, and the only way it gets it.
 *
 * There is no database here, and that is the point of this repository: it can
 * be handed to somebody outside the business without handing them the customer
 * records, the lender rules or the console. What it needs instead it asks the
 * main site for —
 *
 *   GET  /api/rates        what each loan costs at each credit band
 *   GET  /api/site-config  the phone number, the address, the analytics id
 *   POST /api/capture      a lead, into the same queue as every other lead
 *
 * All three are called **from this app's server**, never from the browser.
 * /api/rates is behind a key and /api/capture believes a relayed visitor
 * address and campaign only from a key, and a key shipped to a browser is not
 * a key — anything that reaches a browser is public by the time it arrives.
 * The lead POST therefore goes through this app's own /api/lead, which holds
 * the key and forwards.
 *
 * The key is `LANDING_API_KEY`, and it lives in the environment on the server,
 * never in this repository. Somebody with the code still has no key.
 */

import { mergeContent, type LoansContent } from './content';

/** Set per environment. The default is production, which is where it runs. */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://finmeyo.com').replace(/\/$/, '');

export interface BandRate {
  /** Inclusive floor of the band. */
  min: number;
  label: string;
  low: number | null;
  high: number | null;
  eligible: number;
}

export interface ProductRates {
  total: number;
  from: number | null;
  bands: BandRate[];
}

export interface RateMatrix {
  products: Partial<Record<'home' | 'personal' | 'business', ProductRates>>;
  profiles: Record<string, { loanAmount?: number; tenureMonths?: number; monthlyIncome?: number }>;
  lenders: string[];
}

export interface Contact {
  legalName: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
}

/**
 * What to show when the main site cannot be reached.
 *
 * Not a guess at the rates — those are simply absent, and the page says so
 * rather than printing a number it did not get. The phone number is different:
 * a landing page that cannot tell somebody how to call is worse than one
 * showing a number that has not changed in a year. This is the number in the
 * console today; if it changes there and this is ever used, the page is one
 * deploy behind rather than blank.
 */
export const FALLBACK_CONTACT: Contact = {
  legalName: 'Finmeyo Financial Services',
  phone: '+918076629836',
  phoneDisplay: '+91 80766 29836',
  whatsappNumber: '918076629836',
  email: 'hello@finmeyo.com',
  addressLine1: '',
  addressLine2: '',
};

export interface SiteConfig {
  gaId: string | null;
  gtmId: string | null;
  contact: Contact;
}

/**
 * A read from the main site, or null.
 *
 * Never throws and never blocks the page. A landing page that 500s because an
 * API was slow costs the click and, repeated, the ad account's quality score —
 * so every caller here renders without the data instead.
 */
async function read<T>(path: string, revalidate: number, key = false): Promise<T | null> {
  const secret = process.env.LANDING_API_KEY ?? '';
  if (key && secret.length < 32) {
    console.error(`[api] LANDING_API_KEY is not set; ${path} cannot be read`);
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: key ? { Authorization: `Bearer ${secret}` } : undefined,
      // Cached and revalidated rather than fetched per visitor: these change
      // when somebody edits the console, not between two page views.
      next: { revalidate },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      console.error(`[api] ${path} returned ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[api] could not read ${path}`, error);
    return null;
  }
}

/**
 * The page's copy, from the console.
 *
 * Cached for a minute, so an edit is live within about that and the main site is
 * asked once a minute at most however much traffic an advertisement sends.
 * Falls back to the copy shipped in this repository when the main site cannot be
 * reached or answers with nothing usable — the page it served before the console
 * could edit it, never a blank one.
 */
export async function fetchContent(): Promise<LoansContent> {
  const response = await read<{ content?: unknown }>('/api/landing-content', 60, true);
  return mergeContent(response?.content);
}

export function fetchRates() {
  return read<RateMatrix>('/api/rates', 300, true);
}

export async function fetchConfig(): Promise<SiteConfig> {
  const config = await read<Partial<SiteConfig>>('/api/site-config', 300);
  return {
    gaId: config?.gaId ?? null,
    gtmId: config?.gtmId ?? null,
    // Field by field, so a response missing one key does not blank the footer.
    contact: { ...FALLBACK_CONTACT, ...(config?.contact ?? {}) },
  };
}
