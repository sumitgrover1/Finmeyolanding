/**
 * Cookie consent, shared between the notice that asks and the analytics tag that
 * depends on the answer.
 *
 * Browser-only: every function guards against there being no `window`, so it is
 * safe to import from a component that also renders on the server.
 */

export const CONSENT_KEY = 'finmeyo:cookie-choice';
const CONSENT_EVENT = 'finmeyo:consent-changed';

export type Consent = 'accepted' | 'declined' | null;

export function readConsent(): Consent {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === 'accepted' || stored === 'declined' ? stored : null;
  } catch {
    // Storage blocked. Treat it as "not answered", which means no analytics.
    return null;
  }
}

export function writeConsent(value: Exclude<Consent, null>): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Nothing to remember it with — the notice returns on the next visit.
  }
  // Tell the analytics component in this same page load, so accepting takes
  // effect immediately rather than only after a refresh.
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function onConsentChange(handler: (value: Consent) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<Consent>).detail ?? null);
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}
