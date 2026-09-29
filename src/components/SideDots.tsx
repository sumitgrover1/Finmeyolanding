'use client';

import { useEffect, useState } from 'react';

/**
 * Where you are on a page that is nine screens long, and a way to jump.
 *
 * Two indicators, both cheap, and separate because they live in different
 * places: the bar belongs inside the sticky header, the dots float against the
 * right edge. On a long landing page they are what stops the reader feeling
 * they have fallen into a well.
 *
 * Both measure the document rather than a list written here, so a section
 * added or removed needs no second edit.
 */

export interface Section {
  id: string;
  /** The label that appears on hover. */
  name: string;
  /** Dark sections need light dots to be visible against them. */
  dark: boolean;
}

/** The read-progress bar. Belongs inside the header, which positions it. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const scrollable = root.scrollHeight - root.clientHeight;
      setProgress(scrollable > 0 ? (root.scrollTop / scrollable) * 100 : 0);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return <div className="progress" style={{ width: `${progress}%` }} />;
}

/**
 * The section dots.
 *
 * Hidden below 1100px by the stylesheet, where there is no room for them and
 * the thumb is the navigator anyway.
 */
export function SideDots({ sections }: { sections: Section[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  // The list is a prop rather than a DOM query, so the dots render with the
  // page instead of appearing a frame later — and so the only thing this
  // effect does is subscribe.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { threshold: 0.5 },
    );
    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [sections]);

  const onDark = sections.find((section) => section.id === current)?.dark ?? false;

  return (
    <ul className={onDark ? 'dots on-dark' : 'dots'} aria-label="Page sections">
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={section.id === current ? 'on' : undefined}>
            <span>{section.name}</span>
            <i />
          </a>
        </li>
      ))}
    </ul>
  );
}
