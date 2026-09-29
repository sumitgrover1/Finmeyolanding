/**
 * Sending events to Google.
 *
 * Everything goes into `dataLayer`, not into `gtag` directly. That one choice
 * is what makes the same code work whether the site is running a GA4 tag or a
 * Tag Manager container: GA4's own snippet creates dataLayer and reads from it,
 * and GTM listens to it too. Calling gtag() would work with one and be silently
 * ignored by the other.
 *
 * Nothing here throws and nothing here waits. An analytics call that can break
 * a form submission is a worse bug than any missing measurement, so every path
 * out of this file is a no-op if anything is not as expected — no tag, no
 * consent, an ad blocker, a browser that dislikes us.
 */

export type TrackEvent =
  // The journey
  | 'journey_start'
  | 'journey_step'
  | 'journey_otp_sent'
  | 'journey_otp_verified'
  | 'journey_submit'
  | 'offers_shown'
  // Landing pages and short forms
  | 'capture_view'
  | 'capture_submit'
  // Everything else worth counting
  | 'call_click'
  | 'whatsapp_click'
  | 'guide_cta_click';

interface Layer {
  dataLayer?: Record<string, unknown>[];
}

/**
 * Push one event.
 *
 * The payload is flattened into the event object rather than nested, because
 * that is what GA4 custom dimensions and GTM variables can actually read
 * without somebody writing a lookup for each one.
 */
export function track(event: TrackEvent, params: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === 'undefined') return;

  try {
    const layer = window as unknown as Layer;
    // Created here if the tag has not loaded yet: GA4 and GTM both drain
    // whatever is already in the array when they start, so an event fired
    // before the script arrives is queued rather than lost.
    layer.dataLayer = layer.dataLayer ?? [];

    const clean: Record<string, unknown> = { event };
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') clean[key] = value;
    }

    layer.dataLayer.push(clean);
  } catch {
    // Measurement is never worth an exception in a form handler.
  }
}
