'use client';

import { useEffect, useRef, useState } from 'react';
import type { RateMatrix } from '@/lib/api';
import { rateFrom, showRate, type LoanKey } from '@/lib/rates';
import type { ExplorerProduct, Fact, LoansContent } from '@/lib/content';

/**
 * The four products, one open at a time.
 *
 * A rail of tabs rather than four stacked sections: the reader wants one of
 * these, and scrolling past three they do not want is how they leave. Each
 * panel then has its own chips, because "business loan" is four different
 * conversations depending on whether you need machinery or working capital.
 *
 * The "rates from" line under each tab comes from the main site's rate table,
 * not from this repository. A tab whose product it does not price shows no
 * line at all rather than a stale one.
 *
 * Tabs follow the usual keyboard contract: arrows move and select, because a
 * tablist that only responds to a mouse is a tablist half the people using a
 * keyboard cannot open.
 */

/**
 * A label that started a line, now in the middle of one.
 *
 * Lower-casing the first letter blindly turns "MSME business loan" into "mSME
 * business loan", so an initialism — anything whose first two letters are both
 * capitals — is left exactly as it was written.
 */
function midSentence(label: string): string {
  if (/^[A-Z]{2}/.test(label)) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/**
 * The fact table, with the live rate slotted in where the design put it —
 * second, right after the amount, which is the pair a reader compares.
 * Omitted entirely for a product the catalogue does not price: three cells
 * read better than four with a blank in them.
 */
function factsOf(product: ExplorerProduct, from: number | null): Fact[] {
  if (from === null) return product.facts;
  const [first, ...rest] = product.facts;
  return [first, { label: 'Rate from', value: `${showRate(from)}% p.a.*` }, ...rest];
}

interface Props {
  content: LoansContent;
  rates: RateMatrix | null;
  /** Which tab to show — driven by the header nav and the hero pills too. */
  open: LoanKey;
  onOpen: (key: LoanKey) => void;
  onApply: (loanLabel: string) => void;
}

export function LoanExplorer({ content, rates, open, onOpen, onApply }: Props) {
  const [sub, setSub] = useState<Record<string, number>>({});
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const products = content.explorer.products;

  // Focus follows selection only when the reader is already in the rail;
  // moving focus because another part of the page opened a tab would yank
  // them away from what they were reading.
  const inRail = useRef(false);

  useEffect(() => {
    if (!inRail.current) return;
    const index = products.findIndex((product) => product.key === open);
    tabs.current[index]?.focus();
    inRail.current = false;
  }, [open, products]);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    inRail.current = true;
    onOpen(products[(index + step + products.length) % products.length].key);
  }

  const active = products.find((product) => product.key === open) ?? products[0];
  const subIndex = sub[active.key] ?? 0;
  const activeSub = active.subs[subIndex] ?? active.subs[0];

  return (
    <section className="screen" id="loans" data-name="Loan types">
      <div className="wrap">
        <h2 className="one-line">{content.explorer.heading}</h2>

        <div className="explorer">
          <div className="ltabs" role="tablist" aria-label="Loan types">
            {products.map((product, index) => {
              const from = rateFrom(rates, product.key);
              const selected = product.key === active.key;
              return (
                <button
                  key={product.key}
                  ref={(node) => {
                    tabs.current[index] = node;
                  }}
                  className="ltab"
                  role="tab"
                  id={`t-${product.key}`}
                  aria-controls={`p-${product.key}`}
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onOpen(product.key)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  <b>{product.tab}</b>
                  {/* Absent, not zero, when the catalogue prices nothing. */}
                  {from !== null ? <small>Rates from {showRate(from)}% p.a.</small> : null}
                </button>
              );
            })}
          </div>

          <div>
            <article className="panel" role="tabpanel" id={`p-${active.key}`} aria-labelledby={`t-${active.key}`}>
              <h3>{active.heading}</h3>
              <p>{active.intro}</p>

              <dl className="facts">
                {factsOf(active, rateFrom(rates, active.key)).map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="chips subtabs" role="tablist" aria-label={`${active.tab} options`}>
                {active.subs.map((entry, index) => (
                  <button
                    key={entry.tab}
                    role="tab"
                    aria-selected={index === subIndex}
                    onClick={() => setSub((current) => ({ ...current, [active.key]: index }))}
                  >
                    {entry.tab}
                  </button>
                ))}
              </div>

              <div className="sub">
                <h4>{activeSub.heading}</h4>
                <p>{activeSub.body}</p>
              </div>

              <div className="pfoot">
                <details className="docs">
                  <summary>Documents needed</summary>
                  <ul>
                    {active.documents.map((document) => (
                      <li key={document}>{document}</li>
                    ))}
                  </ul>
                </details>
                <button className="btn btn-primary apply" type="button" onClick={() => onApply(activeSub.loanLabel)}>
                  {`Apply for ${midSentence(activeSub.loanLabel)}`}
                </button>
              </div>
            </article>

            <p className="fine">{content.explorer.fine}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
