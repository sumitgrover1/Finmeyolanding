import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Alive, for the container's health check.
 *
 * Deliberately does not call the main site. A health check that fails because
 * something else is down gets the container restarted for a problem restarting
 * it cannot fix — and this page renders perfectly well without the API, which
 * is the whole point of the fallbacks in src/lib/api.ts.
 */
export async function GET() {
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
