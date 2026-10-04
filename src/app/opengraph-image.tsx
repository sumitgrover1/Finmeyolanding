import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Loans in Gurgaon — every bank’s offer, matched to your CIBIL score';

/**
 * The card a link to this page unfurls as in WhatsApp, Facebook and X.
 *
 * Generated at build time so there is no image file to keep in step with the
 * copy. It says the one thing the page is for rather than the site's tagline:
 * a link to a landing page that previews as a generic logo is a link nobody
 * taps.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #05201e 0%, #0e4f4a 100%)',
          color: '#f6f1e6',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 2, color: '#f0c98a' }}>FINMEYO · GURGAON</div>
        <div style={{ marginTop: 24, fontSize: 70, fontWeight: 800, lineHeight: 1.1 }}>
          The best loan offer in Gurgaon for your CIBIL score
        </div>
        <div style={{ marginTop: 32, fontSize: 30, opacity: 0.9 }}>
          Business · Home · Property · Personal — every partner bank compared, zero fee to you
        </div>
      </div>
    ),
    size,
  );
}
