'use client';

import { useMemo, useState } from 'react';
import type { AreaGroup, LoansContent } from '@/lib/content';

/**
 * Where we lend, and a box to check one place.
 *
 * The list is here for the reader who wants to know whether Pataudi counts,
 * and for search, which is how most of them arrive. The search box is the part
 * that earns its keep: typing "57" answers the question in one keystroke,
 * where scanning a grid of 115 numbers does not.
 *
 * A place that is not on the list is not told "no". We almost certainly cover
 * it; the list is not exhaustive and pretending otherwise turns a lead into a
 * bounce.
 */

interface Props {
  content: LoansContent;
  /** Setting the city on the form is the whole point of finding your area. */
  onCity: (city: string) => void;
}

/** Which of the form's cities an area sits in. */
function cityOf(name: string): string {
  if (/Noida/i.test(name)) return 'Noida';
  if (/Faridabad/i.test(name)) return 'Faridabad';
  if (/Ghaziabad/i.test(name)) return 'Ghaziabad';
  if (/^(Delhi|Dwarka)$/i.test(name)) return 'Delhi';
  return 'Gurgaon';
}

function sectorList(group: AreaGroup): number[] {
  if (!group.sectors) return [];
  const { from, to } = group.sectors;
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export function AreasServed({ content, onCity }: Props) {
  const groups = content.areas.groups;
  const [group, setGroup] = useState(groups[0]?.key ?? 'city');
  const [hit, setHit] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [miss, setMiss] = useState<string | null>(null);

  const sectorGroup = useMemo(() => groups.find((entry) => entry.sectors), [groups]);
  const active = groups.find((entry) => entry.key === group) ?? groups[0];

  function found(name: string) {
    setHit(name);
    setMiss(null);
    onCity(cityOf(name));
  }

  function search(raw: string) {
    setQuery(raw);
    const q = raw.trim().toLowerCase().replace(/^sector\s*/, '');
    if (!q) {
      setHit(null);
      setMiss(null);
      return;
    }

    if (/^\d{1,3}$/.test(q) && sectorGroup?.sectors) {
      const number = Number(q);
      const { from, to } = sectorGroup.sectors;
      if (number >= from && number <= to) {
        setGroup(sectorGroup.key);
        found(`Sector ${number}`);
      } else {
        setHit(null);
        setMiss(`Gurgaon sectors run from ${from} to ${to}. Try another number.`);
      }
      return;
    }

    for (const entry of groups) {
      const match = entry.areas?.find((area) =>
        `${area.name} ${area.alias ?? ''}`.toLowerCase().includes(q),
      );
      if (match) {
        setGroup(entry.key);
        found(match.name);
        return;
      }
    }

    setHit(null);
    setMiss('not-listed');
  }

  return (
    <section className="screen" id="areas-served" data-name="Areas we cover">
      <div className="wrap">
        <div className="area-head">
          <div>
            <h2 className="one-line">{content.areas.heading}</h2>
            <p className="lede">{content.areas.lede}</p>
          </div>
          <label className="search area-search">
            <span className="sr">Check your area or sector</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A5863" strokeWidth="2.4" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              placeholder={content.areas.searchPlaceholder}
              autoComplete="off"
              onChange={(event) => search(event.target.value)}
            />
          </label>
        </div>

        <p className={miss ? 'area-note miss' : 'area-note'} aria-live="polite">
          {hit ? (
            <>
              Yes, we arrange loans in {hit}. <a href="#apply">Check your eligibility</a>
            </>
          ) : miss === 'not-listed' ? (
            <>
              Not on our list yet, but we likely still cover it. <a href="#apply">Ask us</a>
            </>
          ) : (
            miss
          )}
        </p>

        <div className="chips area-tabs" role="tablist" aria-label="Area groups">
          {groups.map((entry) => (
            <button
              key={entry.key}
              role="tab"
              aria-selected={entry.key === active.key}
              onClick={() => setGroup(entry.key)}
            >
              {entry.tab}
            </button>
          ))}
        </div>

        <div className="agroup">
          {active.sectors ? (
            <>
              <p className="sector-seo">{active.sectors.note}</p>
              <div className="sector-grid" aria-label="Gurgaon sectors">
                {sectorList(active).map((number) => (
                  <button
                    key={number}
                    type="button"
                    aria-label={`Sector ${number}`}
                    className={hit === `Sector ${number}` ? 'hit' : undefined}
                    onClick={() => found(`Sector ${number}`)}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <ul className="areas">
              {active.areas?.map((area) => (
                <li key={area.name}>
                  <button
                    type="button"
                    className={hit === area.name ? 'hit' : undefined}
                    onClick={() => found(area.name)}
                  >
                    {area.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
