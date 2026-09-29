'use client';

import { useState } from 'react';
import { formatINR } from '@/lib/format';
import type { LoansContent } from '@/lib/content';

/**
 * Three calculators behind three tabs.
 *
 * The arithmetic is the same reducing-balance EMI the rest of the site uses,
 * so a number here and a number on an offer card agree. Nothing is sent
 * anywhere: these run entirely in the browser, which is also why they can
 * respond to a dragged slider.
 *
 * What they deliberately do not do is quote a rate. The rate is a slider the
 * reader sets, not a promise — the page's rate finder is where the catalogue's
 * own numbers live.
 */

/** Reducing-balance EMI. Zero-rate is the degenerate case and divides evenly. */
function emiOf(principal: number, ratePct: number, years: number): number {
  const r = ratePct / 1200;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Rupees in words, the way the design writes them: "₹25 lakh", "₹1.2 crore".
 *
 * The site's own formatShortINR abbreviates to "₹25 L", which is right in a
 * dense table of offers and wrong beside a slider somebody is dragging — here
 * the number is the sentence.
 */
function short(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2).replace(/\.?0+$/, '')} crore`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1).replace(/\.0$/, '')} lakh`;
  return formatINR(value);
}

const years = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

function Slider({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}) {
  return (
    <div className="slider">
      <div className="row">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type Tab = 'emi' | 'elig' | 'bt';

const TABS: { key: Tab; label: string }[] = [
  { key: 'emi', label: 'EMI calculator' },
  { key: 'elig', label: 'How much can I borrow?' },
  { key: 'bt', label: 'Balance transfer saving' },
];

export function Calculators({ content, onTransfer }: { content: LoansContent; onTransfer: () => void }) {
  const [tab, setTab] = useState<Tab>('emi');

  // EMI
  const [amount, setAmount] = useState(2_500_000);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(15);
  const emi = emiOf(amount, rate, tenure);
  const total = emi * tenure * 12;

  // Eligibility
  const [income, setIncome] = useState(100_000);
  const [existing, setExisting] = useState(10_000);
  const [eRate, setERate] = useState(8.75);
  const [eYears, setEYears] = useState(20);
  // Half of income, less what is already committed. The 50% is an assumption,
  // printed on the card rather than hidden in here: lenders set their own FOIR
  // and the page must not imply this one is a lender's answer.
  const affordable = Math.max(0, income * 0.5 - existing);
  const r = eRate / 1200;
  const n = eYears * 12;
  const borrowable = affordable > 0 ? (affordable * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;

  // Balance transfer
  const [outstanding, setOutstanding] = useState(4_000_000);
  const [oldRate, setOldRate] = useState(9.5);
  const [newRate, setNewRate] = useState(8.25);
  const [left, setLeft] = useState(15);
  const oldEmi = emiOf(outstanding, oldRate, left);
  const newEmi = emiOf(outstanding, newRate, left);
  const monthly = oldEmi - newEmi;

  return (
    <section className="screen calc" id="calculators" data-name="Calculators" data-dark>
      <div className="wrap">
        <h2>{content.calculators.heading}</h2>
        <p className="lede">{content.calculators.lede}</p>

        <div className="chips" role="tablist" aria-label="Calculator" style={{ marginTop: '1.2rem' }}>
          {TABS.map((entry) => (
            <button
              key={entry.key}
              role="tab"
              aria-selected={tab === entry.key}
              onClick={() => setTab(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {tab === 'emi' ? (
          <div className="cpanel">
            <div className="calc-grid">
              <div>
                <Slider id="e-amt" label="Loan amount" value={amount} onChange={setAmount} min={100_000} max={20_000_000} step={100_000} format={short} />
                <Slider id="e-rt" label="Interest rate (p.a.)" value={rate} onChange={setRate} min={7} max={26} step={0.05} format={pct} />
                <Slider id="e-yr" label="Tenure" value={tenure} onChange={setTenure} min={1} max={30} step={1} format={years} />
              </div>
              <div className="out" aria-live="polite">
                <span>Monthly EMI</span>
                <p className="big">{formatINR(emi)}</p>
                <div className="split">
                  <i style={{ width: `${(amount / total) * 100}%` }} />
                </div>
                <div className="split-legend">
                  <span>Principal</span>
                  <span>Interest</span>
                </div>
                <dl>
                  <dt>Total interest</dt>
                  <dd>{formatINR(total - amount)}</dd>
                  <dt>Total payable</dt>
                  <dd>{formatINR(total)}</dd>
                </dl>
                <a className="btn btn-primary" href="#apply" style={{ width: '100%' }}>
                  Find a lower rate
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'elig' ? (
          <div className="cpanel">
            <div className="calc-grid">
              <div>
                <Slider id="l-inc" label="Monthly income" value={income} onChange={setIncome} min={20_000} max={1_000_000} step={5_000} format={formatINR} />
                <Slider id="l-emi" label="Existing EMIs per month" value={existing} onChange={setExisting} min={0} max={300_000} step={1_000} format={formatINR} />
                <Slider id="l-rt" label="Interest rate (p.a.)" value={eRate} onChange={setERate} min={7} max={26} step={0.05} format={pct} />
                <Slider id="l-yr" label="Tenure" value={eYears} onChange={setEYears} min={1} max={30} step={1} format={years} />
              </div>
              <div className="out" aria-live="polite">
                <span>You could borrow up to</span>
                <p className="big">
                  {borrowable > 0 ? short(Math.floor(borrowable / 10_000) * 10_000) : 'Reduce existing EMIs'}
                </p>
                <dl>
                  <dt>EMI you can afford</dt>
                  <dd>{formatINR(affordable)}</dd>
                  <dt>Assumed EMI-to-income limit</dt>
                  <dd>50%</dd>
                </dl>
                <a className="btn btn-primary" href="#apply" style={{ width: '100%' }}>
                  Confirm with real lender criteria
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'bt' ? (
          <div className="cpanel">
            <div className="calc-grid">
              <div>
                <Slider id="b-amt" label="Outstanding loan" value={outstanding} onChange={setOutstanding} min={100_000} max={20_000_000} step={100_000} format={short} />
                <Slider id="b-r1" label="Your current rate" value={oldRate} onChange={setOldRate} min={7} max={26} step={0.05} format={pct} />
                <Slider id="b-r2" label="New rate" value={newRate} onChange={setNewRate} min={7} max={26} step={0.05} format={pct} />
                <Slider id="b-yr" label="Years remaining" value={left} onChange={setLeft} min={1} max={30} step={1} format={years} />
              </div>
              <div className="out" aria-live="polite">
                <span>You could save</span>
                <p className="big">{monthly > 0 ? short(monthly * left * 12) : 'No saving'}</p>
                <dl>
                  <dt>Current EMI</dt>
                  <dd>{formatINR(oldEmi)}</dd>
                  <dt>New EMI</dt>
                  <dd>{formatINR(newEmi)}</dd>
                  <dt>Saving per month</dt>
                  <dd>{formatINR(Math.max(monthly, 0))}</dd>
                </dl>
                <a className="btn btn-primary" href="#apply" style={{ width: '100%' }} onClick={onTransfer}>
                  Transfer my loan
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
