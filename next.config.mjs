import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The loans landing page.
 *
 * Standalone output, because this is deployed as a container next to the main
 * site rather than to a platform that runs `next start` for you.
 */

const ANALYTICS = ['https://www.googletagmanager.com', 'https://*.google-analytics.com'];

/**
 * Content Security Policy.
 *
 * connect-src is the interesting line here: the browser may talk to this
 * origin and to Google's analytics collector, and nothing else — not even the
 * main site, which this app reaches only from its own server. On a page that
 * collects names and phone numbers, that is the directive that matters most:
 * a script injected into it could not post what it read anywhere.
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
  `connect-src 'self' ${ANALYTICS.join(' ')}`,
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
export default {
  output: 'standalone',
  // Pin the project root instead of letting Next infer it from the nearest
  // lockfile. Inferred, a lockfile in any parent directory moves the root up
  // and nests the server at .next/standalone/<dir>/server.js, and the
  // Dockerfile's CMD ["node", "server.js"] then finds nothing to run. It
  // happened in testing, from a stray lockfile two directories up.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
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
