/**
 * The loans landing page.
 *
 * Standalone output, because this is deployed as a container next to the main
 * site rather than to a platform that runs `next start` for you.
 */

/**
 * Where the rates come from and where the leads go.
 *
 * This app has no database. Everything it needs from the business it asks the
 * main site for, over HTTPS, on endpoints that are public by design. That is
 * the whole reason this repository can be handed to somebody: there is nothing
 * in it to leak.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://finmeyo.com';
const ANALYTICS = ['https://www.googletagmanager.com', 'https://*.google-analytics.com'];

/**
 * Content Security Policy.
 *
 * connect-src is the interesting line here: the browser may talk to this
 * origin, to the main site's API, and to Google's analytics collector. Nothing
 * else. A script injected into this page could not post the form's contents
 * anywhere, which on a page that collects names and phone numbers is the
 * directive that matters most.
 *
 * script-src carries 'unsafe-inline' for the same reason the main site's does:
 * the alternative is a per-request nonce, and a nonce makes the page dynamic.
 * A landing page behind paid traffic should be prerendered.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${ANALYTICS.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_BASE} ${ANALYTICS.join(' ')}`,
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
export default {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
