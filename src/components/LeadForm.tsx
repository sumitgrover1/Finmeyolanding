'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import { UTM_KEYS } from '@/lib/attribution';
import { loanOptions, productOfLoan, type LoansContent } from '@/lib/content';

/**
 * The form the page exists for.
 *
 * Two steps, and the order is the point: what you want before who you are.
 * Somebody who has already chosen a loan and an amount has spent something on
 * the page, and asking for a phone number after that costs fewer of them than
 * asking for it first.
 *
 * It posts to this app's own /api/lead, which forwards to the main site's
 * /api/capture with a key — see that route for why the key cannot live in the
 * browser. So a lead from here lands in the same queue, under the same consent
 * record, with the same attribution, and reaches the desk the same way. This
 * page being on its own host and in its own repository changes nothing about
 * where its leads go.
 */

interface Props {
  content: LoansContent;
  whatsapp: string;
  /** Set from elsewhere on the page — a rate finder or an "apply" button. */
  loan: string;
  onLoan: (loan: string) => void;
  creditBand: string;
  onCreditBand: (band: string) => void;
  /** Controlled from the page: finding your area on the map sets it here. */
  city: string;
  onCity: (city: string) => void;
}

type FieldName = 'loan' | 'amount' | 'name' | 'mobile' | 'consent';

export function LeadForm({ content, whatsapp, loan, onLoan, creditBand, onCreditBand, city, onCity }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [employment, setEmployment] = useState(content.form.employments[0] ?? '');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [consent, setConsent] = useState(false);

  const [bad, setBad] = useState<Set<FieldName>>(new Set());
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLSelectElement>(null);

  // Read once, on mount: where this visitor came from, for the lead record.
  // The server reads its own attribution cookie as well and that is what
  // decides credit — this is the page's own view of the same visit.
  const context = useRef<{ utm: Record<string, string>; referrer: string; path: string }>({
    utm: {},
    referrer: '',
    path: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm[key] = value;
    }
    context.current = { utm, referrer: document.referrer, path: window.location.pathname };

    // A ?loan= on the URL preselects the product, so one advertisement can
    // point at the product it advertised without a second landing page.
    const asked = params.get('loan');
    if (asked) {
      const match = loanOptions(content)
        .flatMap((group) => group.options)
        .find((option) => option.toLowerCase().replace(/\s+/g, '-') === asked.toLowerCase());
      if (match) onLoan(match);
    }

    // The denominator: without a view event the submit count has nothing to
    // divide by, and conversion is the only question this page asks.
    track('capture_view', {
      product: 'mixed',
      placement: 'hero',
      campaign: 'loans-gurgaon',
      landing_path: window.location.pathname,
    });
    // Once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function mark(field: FieldName, wrong: boolean) {
    setBad((current) => {
      const next = new Set(current);
      if (wrong) next.add(field);
      else next.delete(field);
      return next;
    });
    return !wrong;
  }

  function toStepTwo() {
    const okLoan = mark('loan', !loan);
    const okAmount = mark('amount', !amount);
    if (!okLoan || !okAmount) {
      (!okLoan ? null : amountRef.current)?.focus({ preventScroll: true });
      return;
    }
    setStep(2);
    // Deferred: the field is being revealed in the same commit.
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 0);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (step === 1) {
      toStepTwo();
      return;
    }

    const okName = mark('name', fullName.trim().length < 2);
    const okMobile = mark('mobile', !/^[6-9]\d{9}$/.test(mobile));
    const okConsent = mark('consent', !consent);
    if (!okName || !okMobile || !okConsent) return;

    setBusy(true);
    setFailed(null);

    const product = productOfLoan(content, loan);
    const band = content.form.amounts.find((entry) => entry.label === amount);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Same origin, so the attribution cookie goes with it by default and
        // our own server can read it and relay it onward.
        credentials: 'same-origin',
        body: JSON.stringify({
          product,
          // The sub-product in the visitor's words, which `product` cannot
          // carry — see productOfLoan.
          loanType: loan,
          fullName,
          mobile,
          loanAmount: band?.amount,
          amountBand: amount,
          creditBand: creditBand || undefined,
          employment,
          city,
          consent,
          campaign: 'loans-gurgaon',
          placement: 'hero',
          landingPath: context.current.path,
          referrer: context.current.referrer,
          utm: context.current.utm,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; reference?: string };
      if (!response.ok) {
        setFailed(data.error ?? 'That did not go through. Please try again, or call us.');
        return;
      }

      track('capture_submit', {
        product,
        loan_type: loan,
        placement: 'hero',
        campaign: 'loans-gurgaon',
        reference: data.reference ?? '',
      });
      setSent(true);
    } catch {
      setFailed('That did not go through. Please check your connection, or call us.');
    } finally {
      setBusy(false);
    }
  }

  const waText = [
    "Hi Finmeyo, I'd like to check my eligibility.",
    `Loan: ${loan}`,
    `Name: ${fullName}`,
    `Mobile: ${mobile}`,
    `Amount: ${amount}`,
    `CIBIL: ${creditBand || 'Not sure'}`,
    `I am: ${employment}`,
    `City: ${city}`,
  ].join('\n');

  const invalid = (field: FieldName) => (bad.has(field) ? 'field invalid' : 'field');

  if (sent) {
    return (
      <div className="card">
        <div className="done show" role="status" aria-live="polite">
          <div className="tick">
            <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden>
              <path
                d="M2 11l8 8L26 3"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="card-title">{content.form.doneTitle}</p>
          <p>
            {`Thanks, ${fullName.trim().split(' ')[0]}. An adviser will call you on ${mobile} today about your ${loan.toLowerCase()}.`}
          </p>
          <a
            className="btn btn-dark"
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_click', { placement: 'lead-form-done' })}
          >
            Continue on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <form onSubmit={submit} noValidate>
        <div className="steps-ind" aria-hidden>
          <i className="on" />
          <i className={step === 2 ? 'on' : undefined} />
        </div>

        {step === 1 ? (
          <div className="step on">
            <p className="card-title">{content.form.step1Title}</p>
            <p className="formsub">{content.form.step1Sub}</p>

            <div className={invalid('loan')}>
              <label htmlFor="f-loan">Which loan do you need?</label>
              <select
                id="f-loan"
                value={loan}
                onChange={(event) => {
                  onLoan(event.target.value);
                  mark('loan', !event.target.value);
                }}
              >
                <option value="">Select a loan</option>
                {loanOptions(content).map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="err">Choose the loan you need.</div>
            </div>

            <div className="row2">
              <div className={invalid('amount')}>
                <label htmlFor="f-amount">Amount needed</label>
                <select
                  id="f-amount"
                  ref={amountRef}
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    mark('amount', !event.target.value);
                  }}
                >
                  <option value="">Select</option>
                  {content.form.amounts.map((band) => (
                    <option key={band.label}>{band.label}</option>
                  ))}
                </select>
                <div className="err">Choose an amount.</div>
              </div>

              <div className="field">
                <label htmlFor="f-cibil">CIBIL score</label>
                <select id="f-cibil" value={creditBand} onChange={(event) => onCreditBand(event.target.value)}>
                  <option value="">Not sure</option>
                  <option>800+</option>
                  <option>750–799</option>
                  <option>700–749</option>
                  <option>650–699</option>
                  <option>Below 650</option>
                  <option>No credit history</option>
                </select>
              </div>
            </div>

            <div className="row2">
              <div className="field">
                <label htmlFor="f-emp">You are</label>
                <select id="f-emp" value={employment} onChange={(event) => setEmployment(event.target.value)}>
                  {content.form.employments.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-city">City</label>
                <select id="f-city" value={city} onChange={(event) => onCity(event.target.value)}>
                  {content.form.cities.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" type="button" onClick={toStepTwo}>
              Next: see my offers
            </button>
            <p className="form-foot">{content.form.foot1}</p>
          </div>
        ) : (
          <div className="step on">
            <p className="card-title">{content.form.step2Title}</p>
            <p className="formsub">{content.form.step2Sub}</p>

            <div className="recap">
              <span>{`${loan}, ${amount}`}</span>
              <button type="button" onClick={() => setStep(1)}>
                Change
              </button>
            </div>

            <div className={invalid('name')}>
              <label htmlFor="f-name">Your name</label>
              <input
                id="f-name"
                ref={nameRef}
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <div className="err">Enter your name.</div>
            </div>

            <div className={invalid('mobile')}>
              <label htmlFor="f-mobile">Mobile number</label>
              <div className="mobile-wrap">
                <b>+91</b>
                <input
                  id="f-mobile"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <div className="err">Enter a 10-digit mobile number starting with 6, 7, 8 or 9.</div>
            </div>

            <div className={invalid('consent')} style={{ marginBottom: 0 }}>
              <label className="consent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>{content.form.consent}</span>
              </label>
              <div className="err" style={{ marginTop: '-.6rem', marginBottom: '.8rem' }}>
                Tick the box so we can call you.
              </div>
            </div>

            {failed ? (
              <p className="err" style={{ display: 'block', marginBottom: '.6rem' }} role="alert">
                {failed}
              </p>
            ) : null}

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Get my loan offers'}
            </button>
            <p className="form-foot">{content.form.foot2}</p>
          </div>
        )}
      </form>
    </div>
  );
}
