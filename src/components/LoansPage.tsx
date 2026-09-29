'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { Analytics } from '@/components/Analytics';
import { Attribution } from '@/components/Attribution';
import { ClickEvents } from '@/components/ClickEvents';
import { headingRuns, type LoansContent } from '@/lib/content';
import type { LoanKey } from '@/lib/rates';
import { API_BASE, type Contact, type RateMatrix } from '@/lib/api';
import { HeroScene } from './HeroScene';
import { LeadForm } from './LeadForm';
import { RateFinder } from './RateFinder';
import { LoanExplorer } from './LoanExplorer';
import { HowItWorks } from './HowItWorks';
import { Calculators } from './Calculators';
import { AreasServed } from './AreasServed';
import { ScrollProgress, SideDots, type Section } from './SideDots';

/**
 * The Gurgaon loans landing page.
 *
 * One client component holding the whole page rather than a tree of islands,
 * because almost everything here talks to something else: the rate finder
 * fills in the form, an "apply" button in the explorer selects a product in
 * it, the area search sets its city, the header's nav opens a tab further
 * down. Threading that through a provider would buy nothing — the page still
 * server-renders to complete HTML, which is what search engines and the first
 * paint need.
 *
 * Contact details and rates both come from the main site — see src/lib/api.ts.
 * Nothing about the business is written into this repository, which is what
 * makes it safe to share: a changed phone number or a repriced lender changes
 * here without a deploy.
 */

interface Props {
  content: LoansContent;
  contact: Contact;
  lenderNames: string[];
  /** The rate table, or null when the main site could not be reached. */
  rates: RateMatrix | null;
  gaId: string | null;
  gtmId: string | null;
}

/** The id the explorer's tabs and the header's links agree on. */
const KEY_OF: Record<string, LoanKey> = {
  'business-loan': 'business',
  'home-loan': 'home',
  'loan-against-property': 'lap',
  'personal-loan': 'personal',
};

/**
 * The sections, in order, for the dot navigator.
 *
 * Declared beside the markup that renders them rather than discovered from the
 * DOM after paint — a list read from the document arrives a frame late, and
 * the dots visibly pop in.
 */
const SECTIONS: Section[] = [
  { id: 'apply', name: 'Apply', dark: true },
  { id: 'rate-finder', name: 'Rates by CIBIL', dark: false },
  { id: 'loans', name: 'Loan types', dark: false },
  { id: 'how', name: 'How it works', dark: false },
  { id: 'about', name: 'Why Finmeyo', dark: false },
  { id: 'calculators', name: 'Calculators', dark: true },
  { id: 'lenders', name: 'Lenders', dark: false },
  { id: 'areas-served', name: 'Areas we cover', dark: false },
  { id: 'faq', name: 'FAQ', dark: false },
  { id: 'contact', name: 'Contact', dark: true },
];

/**
 * The document's current #fragment.
 *
 * Subscribed to rather than read in an effect, so there is no render with the
 * wrong tab open and no hydration mismatch: the server's snapshot is empty,
 * which is exactly what the server knows — a fragment is never sent to it.
 */
function subscribeHash(onChange: () => void) {
  addEventListener('hashchange', onChange);
  return () => removeEventListener('hashchange', onChange);
}

export function LoansPage({ content, contact, lenderNames, rates, gaId, gtmId }: Props) {
  const [loan, setLoan] = useState('');
  const [creditBand, setCreditBand] = useState('');
  const [city, setCity] = useState(content.form.cities[0] ?? '');
  const [chosen, setChosen] = useState<LoanKey | null>(null);

  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => '',
  );

  // A link to #business-loan is a request to open that tab, not to scroll to
  // an element that does not exist — the four products share one panel. An
  // explicit choice wins over the address, which may still hold the last one.
  const open: LoanKey = chosen ?? KEY_OF[hash.replace(/^#/, '')] ?? 'business';

  const openFromHash = useCallback((href: string) => {
    const key = KEY_OF[href.replace(/^#/, '')];
    if (!key) return false;
    setChosen(key);
    document.getElementById('loans')?.scrollIntoView({ behavior: 'smooth' });
    return true;
  }, []);

  const productLink = (href: string) => ({
    href,
    onClick: (event: React.MouseEvent) => {
      if (openFromHash(href)) {
        event.preventDefault();
        history.replaceState(null, '', href);
      }
    },
  });

  /** Choose a loan in the form and take the reader to it. */
  const apply = useCallback((label: string, band?: string) => {
    setLoan(label);
    if (band) setCreditBand(band);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const tel = `tel:${contact.phone}`;
  const wa = `https://wa.me/${contact.whatsappNumber}`;

  return (
    <div className="lp-root">
      <header className="top">
        <div className="wrap">
          <a className="logo" href={API_BASE} aria-label={`${contact.legalName} home`}>
            <Mark />
            <span>Finmeyo</span>
          </a>
          <nav className="nav" aria-label="Loan types">
            {content.nav.map((link) => (
              <a key={link.href} {...productLink(link.href)}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="btn btn-dark" href={tel}>
            Call {contact.phoneDisplay.replace(/^\+91\s*/, '')}
          </a>
        </div>
        <ScrollProgress />
      </header>

      <SideDots sections={SECTIONS} />

      <main>
        {/* 1 — the offer and the form, on one screen */}
        <section className="screen hero" id="apply" data-name="Apply" data-dark>
          <HeroScene />
          <div className="scrim" />
          <div className="wrap">
            <div>
              <nav className="crumb" aria-label="Breadcrumb">
                <a href={API_BASE}>Home</a> / {content.hero.crumb}
              </nav>
              <h1>
                {headingRuns(content.hero.heading).map((run, index) =>
                  run.gold ? <em key={index}>{run.text}</em> : <span key={index}>{run.text}</span>,
                )}
              </h1>
              <p className="lede">{content.hero.lede}</p>
              <ul className="ticks-list">
                {content.hero.ticks.map((tick) => (
                  <li key={tick}>{tick}</li>
                ))}
              </ul>
              <div className="pillrow">
                {content.hero.pills.map((pill) => (
                  <a key={pill.href} {...productLink(pill.href)}>
                    {pill.label}
                  </a>
                ))}
              </div>
            </div>

            <LeadForm
              content={content}
              whatsapp={contact.whatsappNumber}
              loan={loan}
              onLoan={setLoan}
              creditBand={creditBand}
              onCreditBand={setCreditBand}
              // Controlled rather than owned by the form, because finding your
              // sector further down the page is meant to fill this in.
              city={city}
              onCity={setCity}
            />
          </div>
        </section>

        {/* 2 */}
        <RateFinder content={content} rates={rates} onApply={(label, band) => apply(label, band)} />

        {/* 3 */}
        <LoanExplorer content={content} rates={rates} open={open} onOpen={setChosen} onApply={(label) => apply(label)} />

        {/* 4 */}
        <HowItWorks content={content} />

        {/* 5 — who we are, which a finance page is judged on */}
        <section className="screen" id="about" data-name="Why Finmeyo">
          <div className="wrap">
            <h2 className="one-line">{content.about.heading}</h2>
            <p className="lede">{content.about.lede}</p>
            <div className="why-grid">
              {content.about.cards.map((card) => (
                <article className="why-card" key={card.heading}>
                  <span className="ck" aria-hidden>
                    <Tick />
                  </span>
                  <div>
                    <h3>{card.heading}</h3>
                    <p>{card.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6 */}
        <Calculators content={content} onTransfer={() => apply('Home loan balance transfer')} />

        {/* 7 — the panel, read from the catalogue rather than typed here */}
        <section className="screen" id="lenders" data-name="Lenders" style={{ background: 'var(--mint)' }}>
          <div className="wrap">
            <h2 className="one-line">
              {lenderNames.length > 0
                ? `${lenderNames.length} banks and NBFCs we compare for you`
                : content.lenders.heading}
            </h2>
            <p className="lede">{content.lenders.lede}</p>
            {lenderNames.length > 0 ? (
              <div className="marquee" aria-label="Lender list">
                <ul>
                  {/* Twice, so the loop has no seam. The copy is hidden from
                      assistive technology, which should hear the list once. */}
                  {lenderNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                  {lenderNames.map((name) => (
                    <li key={`${name}-echo`} aria-hidden>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        {/* 8 */}
        <AreasServed content={content} onCity={setCity} />

        {/* 9 */}
        <section className="screen" id="faq" data-name="FAQ">
          <div className="wrap">
            <div className="faq-top">
              <h2>{content.faq.heading}</h2>
            </div>
            <div className="faq-grid">
              {/* Read down the left column, then down the right. Dealing the
                  questions out one to each side reads across, which puts the
                  seventh question beside the first and breaks the order the
                  copy was written in. */}
              {[0, 1].map((column) => (
                <div key={column}>
                  {content.faq.items
                    .filter((_, index) => (index < Math.ceil(content.faq.items.length / 2) ? 0 : 1) === column)
                    .map((item) => (
                      <details key={item.q}>
                        <summary>{item.q}</summary>
                        <p>{item.a}</p>
                      </details>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10 */}
        <section className="screen end" id="contact" data-name="Contact" data-dark>
          <div className="cta">
            <div className="wrap">
              <h2 className="one-line">{content.end.heading}</h2>
              <p className="lede">{content.end.lede}</p>
              <div className="btns">
                <a className="btn btn-primary" href="#apply">
                  {content.end.primary}
                </a>
                <a className="btn btn-ghost" href={tel}>
                  Call {contact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>

          <footer>
            <div className="wrap">
              <div className="logo-chip">
                <a className="logo" href={API_BASE} aria-label={`${contact.legalName} home`}>
                  <Mark />
                  <span>Finmeyo</span>
                </a>
              </div>
              <p>
                <strong style={{ color: '#fff' }}>{contact.legalName}</strong>, {contact.addressLine2}.{' '}
                {content.footer.intro}
              </p>
              <p>{content.footer.disclaimer}</p>
              <div className="flinks">
                {/* The legal pages are the business's, not this page's, and
                    they live on the main site. Linking to copies here would
                    mean two privacy policies that disagree after the first
                    edit. */}
                <a href={`${API_BASE}/privacy-policy`}>Privacy policy</a>
                <a href={`${API_BASE}/terms`}>Terms</a>
                <a href={`${API_BASE}/grievance`}>Grievance</a>
                <a href={tel}>
                  {contact.phoneDisplay}
                </a>
              </div>
            </div>
          </footer>
        </section>
      </main>

      <a className="wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3z" />
        </svg>
      </a>

      {/*
        The three the rest of the site mounts on every page, and this page
        needs more than most.

        Attribution is the one that would have been missed. It writes the
        first-party cookie that says which advertisement brought this visitor,
        and /api/capture reads it server-side when the form is submitted —
        without it every lead from a paid click files as "direct", which is the
        one number this page exists to produce.

        Analytics loads the tag and the consent banner; ClickEvents counts the
        phone and WhatsApp taps with a single delegated listener, which is why
        none of the links here carry their own handler.
      */}
      <Attribution />
      <ClickEvents />
      <Analytics gaId={gaId} gtmId={gtmId} />

      <div className="mbar">
        <a className="btn btn-ghost" href={tel}>
          Call
        </a>
        <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        <a className="btn btn-primary" href="#apply">
          Apply now
        </a>
      </div>
    </div>
  );
}

/** The wordmark's shield, at the size the header and footer draw it. */
function Mark() {
  return (
    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <rect width="72" height="72" rx="16" fill="#244E4A" />
      <path d="M16 60V28Q16 15 36 9Q56 15 56 28V60H48V33Q48 23.5 36 18.5Q24 23.5 24 33V60Z" fill="#EACB92" />
      <path d="M36 34.2L41 40.4L36 46.6L31 40.4Z" fill="#EACB92" />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" aria-hidden>
      <path
        d="M1.5 6.5l4.5 4.5L14.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
