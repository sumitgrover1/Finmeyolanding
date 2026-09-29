'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

/**
 * Counts calls, WhatsApp taps and article CTAs — everywhere, with one listener.
 *
 * The alternative was an onClick on each of the nine or so places that offer a
 * phone number. That version is wrong the moment somebody adds a tenth — and
 * on this site they will, because landing pages and guides are edited in the
 * console and can put a tel: link anywhere. A delegated listener on the
 * document cannot go stale that way.
 *
 * It also keeps the components that own those links as server components. A
 * CTA marks itself with data-cta on any ancestor of the link, and nothing about
 * that markup needs JavaScript shipped for it.
 *
 * Capture phase, because the click has to be counted before anything else
 * cancels it, and because navigating away from the page does not wait for us:
 * dataLayer.push is synchronous, so the event is in the queue before the
 * browser hands over to the dialler.
 *
 * Deliberately not counted: a mailto:. Nobody has ever asked what the email
 * click-through rate is, and an event nobody reads is just noise in the
 * property.
 */
export function ClickEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Modified clicks open a new tab rather than dial or navigate here; not
      // the intent we are counting.
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') ?? '';
      const path = window.location.pathname;

      if (href.startsWith('tel:')) {
        track('call_click', { placement: path });
        return;
      }
      if (/^https?:\/\/(?:api\.)?wa(?:\.me|tsapp\.com)/i.test(href)) {
        track('whatsapp_click', { placement: path });
        return;
      }

      const cta = link.closest<HTMLElement>('[data-cta]');
      if (cta) {
        track('guide_cta_click', {
          placement: cta.dataset.cta ?? 'unknown',
          destination: href,
          source_path: path,
        });
      }
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
