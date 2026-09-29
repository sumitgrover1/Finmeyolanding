import { API_BASE } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The form posts here, and this forwards it to the main site.
 *
 * A same-origin route rather than the browser posting to finmeyo.com
 * directly, and the reason is the key. The main site's /api/capture will only
 * believe a caller about somebody else's address and campaign if that caller
 * presents a key — and a key in a browser is not a key, because anything
 * shipped to a browser is public by the time it arrives. So the key lives
 * here, on the server, and never leaves it.
 *
 * It also means the browser makes no cross-origin request at all: no CORS, no
 * preflight, and the page's connect-src can stay 'self'.
 *
 * Two things are relayed because only this server can know them:
 *
 *   the visitor's address, so the main site throttles and records the person
 *   rather than this container, which would otherwise look like one machine
 *   sending every lead in Gurgaon;
 *
 *   the attribution cookie, which the browser sent us and not them — it is
 *   what says which advertisement produced the enquiry.
 *
 * The main site validates both. The key buys the right to relay them, not to
 * invent them.
 */

/** Our own cookie, by the name the main site reads it under. */
const ATTRIBUTION_COOKIE = 'fm_src';

/** Passed straight through; the main site validates every one of them. */
const FIELDS = [
  'product',
  'loanType',
  'fullName',
  'mobile',
  'email',
  'loanAmount',
  'amountBand',
  'creditBand',
  'employment',
  'city',
  'pincode',
  'consent',
  'campaign',
  'placement',
  'landingPath',
  'referrer',
  'utm',
] as const;

export async function POST(request: Request) {
  const key = process.env.LANDING_API_KEY ?? '';
  if (key.length < 32) {
    // Loud, because the alternative is a form that silently stops working and
    // a day of leads nobody knows were lost.
    console.error('[lead] LANDING_API_KEY is not set; the form cannot submit');
    return Response.json(
      { error: 'We could not send that just now. Please call us.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Copied field by field rather than spread: this forwards to an endpoint
  // that writes to a database, and a body we pass through wholesale is a body
  // whose shape we have stopped controlling.
  const source = body as Record<string, unknown>;
  const payload: Record<string, unknown> = {};
  for (const field of FIELDS) if (source[field] !== undefined) payload[field] = source[field];

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  const attribution = request.headers
    .get('cookie')
    ?.split('; ')
    .find((entry) => entry.startsWith(`${ATTRIBUTION_COOKIE}=`))
    ?.slice(ATTRIBUTION_COOKIE.length + 1);

  try {
    const response = await fetch(`${API_BASE}/api/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...(ip ? { 'X-Forwarded-For': ip } : {}),
        ...(attribution ? { 'X-Visitor-Attribution': attribution } : {}),
        'User-Agent': request.headers.get('user-agent') ?? 'finmeyo-loans-landing',
      },
      body: JSON.stringify(payload),
      // Longer than a page read: this one is a person waiting with their
      // thumb on the button, and giving up early loses a lead we already had.
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string; reference?: string };
    if (!response.ok) {
      // The main site's own wording is shown, because it is the one that knows
      // what was wrong with the submission — a duplicate, a throttle, a
      // missing consent box.
      console.error('[lead] the main site refused a lead', response.status, data.error);
      return Response.json(
        { error: data.error ?? 'That did not go through. Please try again, or call us.' },
        { status: response.status },
      );
    }

    return Response.json({ reference: data.reference ?? null }, { status: 201 });
  } catch (error) {
    console.error('[lead] could not reach the main site', error);
    return Response.json(
      { error: 'We could not send that just now. Please call us.' },
      { status: 502 },
    );
  }
}
