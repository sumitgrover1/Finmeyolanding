import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

/**
 * The two faces this page is drawn in.
 *
 * Through next/font, so they are self-hosted, carry no layout shift and need
 * no request to Google — which also keeps the connect-src in the CSP short.
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});
