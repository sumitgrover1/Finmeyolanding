'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import { onConsentChange, readConsent, writeConsent, type Consent } from '@/lib/consent';
import { API_BASE } from '@/lib/api';

/**
 * Analytics and its consent notice, together — because they are one decision.
 *
 * Nothing loads unless a measurement id is configured **and** the visitor has
 * accepted. Declining, or simply not answering, means the third-party script
 * is never requested: a banner whose "Decline" does nothing is worse than no
 * banner at all.
 *
 * The ids are the main site's, passed in from the server render, so this page
 * reports into the same property as everything else. Measuring a landing page
 * in a property of its own would mean a funnel that starts in one report and
 * finishes in another.
 *
 * Drawn with this page's own stylesheet rather than the site's utility
 * classes — this repository does not carry them, and a serif notice on a sans
 * page looked like somebody else's banner, which is the worst thing a consent
 * notice can look like.
 */
/**
 * The stored choice, as an external store.
 *
 * The server cannot know what this visitor chose, so its snapshot is
 * 'unknown' and the notice is not rendered during SSR — which is what stops
 * it flashing at somebody who accepted last week. React swaps in the real
 * value on hydration without an effect, and without the extra render an
 * effect would cost.
 */
function subscribe(onChange: () => void) {
  return onConsentChange(onChange);
}

export function Analytics({ gaId, gtmId }: { gaId: string | null; gtmId: string | null }) {
  const consent = useSyncExternalStore<Consent | 'unknown'>(subscribe, readConsent, () => 'unknown');

  if (!gaId && !gtmId) return null;

  return (
    <>
      {consent === 'accepted' && (
        <>
          {/* Tag Manager, when a container is configured. Preferred over the
              raw GA4 tag: every event this page fires goes into dataLayer, so
              a container can route them anywhere — Ads, Meta, a call tracker —
              without another deploy. */}
          {gtmId && (
            <Script id="gtm-init" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
          )}

          {/* The GA4 tag directly, for a site with no container. Both can run:
              if the container also holds a GA4 tag, configure only one of the
              two or every hit is counted twice. */}
          {gaId && !gtmId && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
              <Script id="ga-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
              </Script>
            </>
          )}
        </>
      )}

      {consent === null && (
        <div className="cookie">
          <p>
            We use essential cookies to run this page, and analytics cookies to understand which pages help
            people. You can decline the analytics ones.{' '}
            <a href={`${API_BASE}/privacy-policy`}>Privacy policy</a>
          </p>
          <div className="cookie-btns">
            <button type="button" className="btn btn-primary" onClick={() => writeConsent('accepted')}>
              Accept
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => writeConsent('declined')}>
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
