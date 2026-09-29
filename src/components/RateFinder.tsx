'use client';

import { useState } from 'react';
import type { RateMatrix } from '@/lib/api';
import { PRICED, SCORE_MAX, SCORE_MIN, bandFor, formBandOf, showRate, totalFor, type LoanKey } from '@/lib/rates';
import { headingRuns, type LoansContent } from '@/lib/content';

/**
 * What a loan costs at a given credit score.
 *
 * The number on screen is not written into this page. It comes from the main
 * site's /api/rates, which computes it from the live lender catalogue with the
 * same engine the comparison tool and the application journey use — so a rate
 * on an advertisement cannot disagree with the rate the visitor is quoted a
 * minute later, and editing a lender in the console is what changes it.
 *
 * The whole table arrives with the page, so dragging the slider is a lookup,
 * not a request.
 *
 * The honest cases are the ones worth reading. No lender clears at this score:
 * it says so, with what to do instead, rather than showing an optimistic
 * range. A loan against property: no catalogue rate exists, so it offers a
 * conversation instead of a figure. The main site unreachable: the section
 * still renders, and says the rates could not be read.
 */

const CHIPS: { key: LoanKey; label: string }[] = [
  { key: 'home', label: 'Home loan' },
  { key: 'lap', label: 'Loan against property' },
  { key: 'personal', label: 'Personal loan' },
  { key: 'business', label: 'Business loan' },
];

const QUICK = [
  { score: 630, label: 'Below 650' },
  { score: 680, label: '650–699' },
  { score: 725, label: '700–749' },
  { score: 775, label: '750–799' },
  { score: 830, label: '800+' },
];

/** Ten bars, lit in proportion to how many lenders cleared. */
const BARS = 10;

interface Props {
  content: LoansContent;
  rates: RateMatrix | null;
  onApply: (loan: string, creditBand: string) => void;
}

export function RateFinder({ content, rates, onApply }: Props) {
  const [key, setKey] = useState<LoanKey>('home');
  const [score, setScore] = useState(760);

  const band = bandFor(rates, key, score);
  const total = totalFor(rates, key);
  const product = content.explorer.products.find((entry) => entry.key === key);
  const lit = band && total > 0 ? Math.round((band.eligible / total) * BARS) : 0;

  return (
    <section className="screen finder" id="rate-finder" data-name="Rates by CIBIL">
      <div className="wrap">
        <h2>
          {headingRuns(content.finder.heading).map((run, index) =>
            run.gold ? <em key={index}>{run.text}</em> : <span key={index}>{run.text}</span>,
          )}
        </h2>
        <p className="lede">{content.finder.lede}</p>

        <div className="finder-grid">
          <div>
            <div className="chips" role="group" aria-label="Loan type">
              {CHIPS.map((chip) => (
                <button key={chip.key} type="button" aria-pressed={key === chip.key} onClick={() => setKey(chip.key)}>
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="score-label">
              <label htmlFor="score">Your CIBIL score</label>
              <span className="score-val">{score}</span>
            </div>
            <input
              className="score-range"
              type="range"
              id="score"
              min={SCORE_MIN}
              max={SCORE_MAX}
              step={5}
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
            />
            <div className="ticks">
              <span>600</span>
              <span>700</span>
              <span>750</span>
              <span>800</span>
              <span>900</span>
            </div>
            <div className="quick" aria-label="Jump to a score">
              {QUICK.map((entry) => (
                <button key={entry.score} type="button" onClick={() => setScore(entry.score)}>
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="verdict" aria-live="polite">
            <p className="band">{band?.label ?? formBandOf(score)}</p>

            {PRICED[key] === null ? (
              // A loan against property is priced against the property, and
              // the catalogue holds no rule set for it. Saying so is better
              // than showing a number nobody would honour.
              <>
                <p className="rate">
                  Quoted on your property <small>not your score alone</small>
                </p>
                <p className="count">
                  A LAP is assessed on the property first, so lenders look at files a personal or business
                  loan would turn away.
                </p>
                <p className="tip">
                  Tell us the property and the amount and we will come back with what each lender will
                  actually write.
                </p>
              </>
            ) : rates === null ? (
              // The main site could not be reached when this page was built.
              // The section stays, without numbers it did not get.
              <>
                <p className="rate">
                  Ask us <small>today’s range</small>
                </p>
                <p className="count">We could not load our lenders’ current rates just now.</p>
                <p className="tip">Send your details and an adviser will tell you what each lender is quoting.</p>
              </>
            ) : band && band.low !== null && band.high !== null ? (
              <>
                <p className="rate">
                  {showRate(band.low)}
                  {band.high > band.low ? `–${showRate(band.high)}` : ''}% <small>p.a.</small>
                </p>
                <div className="meter" aria-hidden>
                  {Array.from({ length: BARS }, (_, index) => (
                    <i key={index} className={index < lit ? 'on' : undefined} />
                  ))}
                </div>
                <p className="count">
                  {band.eligible} of our {total} lenders consider this profile
                </p>
                <p className="tip">
                  {band.eligible >= total - 1
                    ? 'Almost every lender will look at you. Comparing three offers is where the saving is.'
                    : band.eligible >= Math.ceil(total / 2)
                      ? 'Plenty of choice. Compare the processing fee as well as the rate.'
                      : 'Fewer lenders at this score, so which one you apply to matters more than usual.'}
                </p>
              </>
            ) : (
              <>
                <p className="rate">
                  Not on this profile <small>yet</small>
                </p>
                <p className="count">
                  No lender in our panel writes this loan at {score} on the profile we price against.
                </p>
                <p className="tip">
                  A loan against property, a co-applicant with a higher score, or clearing an overdue
                  account first usually costs far less than applying and being declined.
                </p>
              </>
            )}

            <a
              className="btn btn-dark"
              href="#apply"
              style={{ marginTop: '1.1rem' }}
              onClick={() => onApply(product?.tab ?? 'Home loan', formBandOf(score))}
            >
              {content.finder.cta}
            </a>
          </div>
        </div>

        <p className="fine">{content.finder.fine}</p>
      </div>
    </section>
  );
}
