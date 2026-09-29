'use client';

import { useState } from 'react';
import type { LoansContent } from '@/lib/content';

/**
 * Three steps, and the comparison underneath them.
 *
 * The toggle is doing real work, not decoration. Two columns side by side
 * invite a reader to skim both and believe neither; one list at a time, that
 * they chose to switch to, gets read. It opens on our side because that is the
 * claim the page is making — the other side is there to be checked.
 */
export function HowItWorks({ content }: { content: LoansContent }) {
  const [mode, setMode] = useState<'bank' | 'us'>('us');
  const items = mode === 'bank' ? content.how.bank : content.how.us;

  return (
    <section className="screen" id="how" data-name="How it works" style={{ background: '#fff' }}>
      <div className="wrap">
        <h2 className="one-line">{content.how.heading}</h2>

        <ol className="flow">
          {content.how.steps.map((step) => (
            <li key={step.heading}>
              <div>
                <h3>{step.heading}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={mode === 'bank' ? 'vs bank' : 'vs'}>
          <div className="switch" role="group" aria-label="Compare">
            <button type="button" aria-pressed={mode === 'bank'} onClick={() => setMode('bank')}>
              {content.how.bankLabel}
            </button>
            <button type="button" aria-pressed={mode === 'us'} onClick={() => setMode('us')}>
              {content.how.usLabel}
            </button>
          </div>
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
