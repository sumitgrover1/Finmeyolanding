/**
 * Where a lead came from.
 *
 * Pure, and deliberately independent of Google Analytics. Analytics answers
 * "how many"; this answers "this person, this enquiry, which advertisement" —
 * and it has to keep answering months later when somebody asks whether a
 * campaign paid for itself. A number in a dashboard cannot be reconciled
 * against a disbursal; a field on the lead can.
 *
 * It also has to work when the visitor declines analytics, because the
 * commercial question does not go away when the tracking script does.
 */

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

/** Click ids, so a lead can be matched back to a specific ad click. */
export const CLICK_KEYS = ['gclid', 'fbclid', 'msclkid', 'wbraid', 'gbraid'] as const;

export interface Attribution {
  /** Where the visit came from, in one word, for grouping. */
  source: string;
  /** cpc, organic, referral, social, email, direct… */
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** The ad click id, whichever network it came from. */
  clickId?: string;
  clickIdType?: string;
  /** The page they landed on, and what sent them. */
  landingPath?: string;
  referrer?: string;
  /** When the visit that produced this attribution happened. */
  firstSeen?: string;
}

const MAX = 160;

function clean(value: string | null | undefined, max = MAX): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Search engines and the big social networks, by hostname fragment.
 *
 * Matched on a fragment rather than an exact host because every one of these
 * has a hundred country domains — google.co.in, google.com.au — and a table of
 * all of them would be wrong within a month.
 */
/**
 * Each entry is [what to look for in the hostname, what to call it].
 *
 * The name is spelled out rather than derived from the host, because deriving
 * it is wrong the moment there is a subdomain: m.facebook.com's first label is
 * "m", and t.co is Twitter. Both were real answers before this was a table.
 */
const SEARCH: [string, string][] = [
  ['google.', 'google'],
  ['bing.', 'bing'],
  ['yahoo.', 'yahoo'],
  ['duckduckgo.', 'duckduckgo'],
  ['ecosia.', 'ecosia'],
  ['baidu.', 'baidu'],
  ['yandex.', 'yandex'],
];

const SOCIAL: [string, string][] = [
  ['facebook.', 'facebook'],
  ['instagram.', 'instagram'],
  ['linkedin.', 'linkedin'],
  ['twitter.', 'twitter'],
  ['x.com', 'twitter'],
  ['t.co', 'twitter'],
  ['youtube.', 'youtube'],
  ['pinterest.', 'pinterest'],
  ['reddit.', 'reddit'],
  ['quora.', 'quora'],
];

const CHAT: [string, string][] = [
  ['whatsapp', 'whatsapp'],
  ['wa.me', 'whatsapp'],
  ['telegram', 'telegram'],
  ['t.me', 'telegram'],
];

/**
 * What to call a referrer we were not tagged for.
 *
 * Only reached when there are no utm parameters, which in practice means
 * organic search, a link somebody shared, or a direct visit. Getting this
 * roughly right matters more than getting it exactly right: the tagged traffic
 * is where the money is, and this is the residue.
 */
export function classifyReferrer(referrer: string | undefined, selfHost?: string): { source: string; medium: string } {
  if (!referrer) return { source: 'direct', medium: 'none' };

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: 'direct', medium: 'none' };
  }

  // A link from one of our own pages is not a new source. Without this every
  // internal navigation would overwrite the real attribution with "referral".
  if (selfHost && (host === selfHost || host.endsWith(`.${selfHost}`))) {
    return { source: 'internal', medium: 'internal' };
  }

  const named = (table: [string, string][], medium: string) => {
    const hit = table.find(([fragment]) => host.includes(fragment));
    return hit ? { source: hit[1], medium } : null;
  };

  // Chat first: t.me would otherwise never be reached past twitter's t.co.
  return (
    named(CHAT, 'chat') ??
    named(SEARCH, 'organic') ??
    named(SOCIAL, 'social') ?? {
      // An unrecognised host is reported as itself, minus the www, because the
      // domain is the useful thing about a referral.
      source: host.replace(/^www\./, ''),
      medium: 'referral',
    }
  );
}

/**
 * Build the attribution for a landing.
 *
 * utm parameters win over the referrer, always: they are what we set on the
 * advertisement, and the referrer for a Google Ads click is google.com, which
 * would file paid traffic as organic and make the whole report a lie.
 */
export function attributionFrom(
  params: URLSearchParams,
  options: { referrer?: string; path?: string; selfHost?: string; now?: Date } = {},
): Attribution {
  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, clean(params.get(key))]),
  ) as Record<(typeof UTM_KEYS)[number], string | undefined>;

  let clickId: string | undefined;
  let clickIdType: string | undefined;
  for (const key of CLICK_KEYS) {
    const value = clean(params.get(key), 200);
    if (value) {
      clickId = value;
      clickIdType = key;
      break;
    }
  }

  const referrer = clean(options.referrer, 300);
  const fallback = classifyReferrer(referrer, options.selfHost);

  // A click id with no utm_medium is still paid traffic — somebody forgot to
  // tag the ad, and filing it as organic would overstate organic every time.
  const medium = utm.utm_medium ?? (clickId ? 'cpc' : fallback.medium);
  const source =
    utm.utm_source ?? (clickId ? (clickIdType === 'fbclid' ? 'facebook' : 'google') : fallback.source);

  return {
    source,
    medium,
    campaign: utm.utm_campaign,
    content: utm.utm_content,
    term: utm.utm_term,
    clickId,
    clickIdType,
    landingPath: clean(options.path, 200),
    referrer,
    firstSeen: (options.now ?? new Date()).toISOString(),
  };
}

/**
 * Whether a new landing should replace what is already stored.
 *
 * Last non-direct touch wins, which is the convention most ad platforms report
 * against — so our numbers can at least be compared to theirs. What it must
 * never do is let an internal link or a direct visit erase the campaign that
 * actually brought somebody in: a visitor who arrives from an advertisement,
 * reads three guides and comes back the next day by typing the address is
 * still that advertisement's lead.
 */
export function shouldReplace(existing: Attribution | null, incoming: Attribution): boolean {
  if (!existing) return true;
  if (incoming.medium === 'internal') return false;
  if (incoming.source === 'direct') return false;
  return true;
}

// --- the cookie -------------------------------------------------------------

export const ATTRIBUTION_COOKIE = 'fm_src';
/** Long enough to cover a considered purchase, short enough to stay honest. */
export const ATTRIBUTION_DAYS = 30;

/**
 * Base64url, in the browser and on the server.
 *
 * Written by hand rather than with Buffer, which does not exist in a browser —
 * and this module is imported by both the client component that writes the
 * cookie and the route that reads it. The first version used Buffer, the
 * client threw inside a useEffect, and the cookie was silently never set:
 * every lead came out as "direct" with nothing in the log to say why.
 */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 =
    typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === 'function') {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function encode(attribution: Attribution): string {
  // Compact, opaque enough not to invite editing, and it survives a cookie
  // value without escaping.
  return toBase64Url(JSON.stringify(attribution));
}

/**
 * Read a stored attribution.
 *
 * The value is a cookie, which means it is attacker-controlled: anything that
 * is not the shape we wrote is discarded rather than trusted. A forged
 * attribution costs us a wrong row in a report; a forged anything else that we
 * treated as data could cost more.
 */
export function decode(value: string | undefined | null): Attribution | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(value));
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record.source !== 'string' || typeof record.medium !== 'string') return null;

    return {
      source: record.source.slice(0, MAX),
      medium: record.medium.slice(0, MAX),
      campaign: clean(record.campaign as string),
      content: clean(record.content as string),
      term: clean(record.term as string),
      clickId: clean(record.clickId as string, 200),
      clickIdType: clean(record.clickIdType as string, 20),
      landingPath: clean(record.landingPath as string, 200),
      referrer: clean(record.referrer as string, 300),
      firstSeen: clean(record.firstSeen as string, 40),
    };
  } catch {
    return null;
  }
}

/** One line for a list screen: "google / cpc · diwali-business". */
export function describeAttribution(attribution: Attribution | null): string {
  if (!attribution) return 'Unknown';
  const head = `${attribution.source} / ${attribution.medium}`;
  return attribution.campaign ? `${head} · ${attribution.campaign}` : head;
}
