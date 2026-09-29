'use client';

import { useEffect } from 'react';
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_DAYS,
  attributionFrom,
  decode,
  encode,
  shouldReplace,
} from '@/lib/attribution';

/**
 * Remembers where a visitor came from, so a lead can say what brought it.
 *
 * A first-party cookie, written by us, read only by us, and never sent
 * anywhere else. It is not an analytics cookie and does not wait for the
 * analytics banner: it records which of our own advertisements produced an
 * enquiry the visitor then chose to send us, which is the sort of thing a
 * business is entitled to know about its own leads. Nothing is stored about
 * somebody who never submits a form beyond this one value on their own device.
 *
 * The alternative was to read utm parameters at submit time. That fails the
 * common case: people land on an advertisement, read two guides, and apply
 * from a page whose URL has no parameters at all.
 */
export function Attribution() {
  useEffect(() => {
    try {
      const current = decode(
        document.cookie
          .split('; ')
          .find((entry) => entry.startsWith(`${ATTRIBUTION_COOKIE}=`))
          ?.split('=')[1],
      );

      const incoming = attributionFrom(new URLSearchParams(window.location.search), {
        referrer: document.referrer || undefined,
        path: window.location.pathname,
        selfHost: window.location.hostname.replace(/^www\./, ''),
      });

      if (!shouldReplace(current, incoming)) return;

      const expires = new Date(Date.now() + ATTRIBUTION_DAYS * 86_400_000).toUTCString();
      // Lax rather than Strict: a visitor arriving from an advertisement is a
      // cross-site navigation, which is precisely when this has to be readable.
      document.cookie =
        `${ATTRIBUTION_COOKIE}=${encode(incoming)}; path=/; expires=${expires}; SameSite=Lax` +
        (window.location.protocol === 'https:' ? '; Secure' : '');
    } catch {
      // A browser refusing cookies is a visitor we simply cannot attribute.
      // It must never be a visitor who cannot use the site.
    }
  }, []);

  return null;
}
