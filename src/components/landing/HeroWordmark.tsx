import React from 'react';

/**
 * Large «إنصاف» background wordmark for the hero.
 * Choreography (14s loop): the gradient stroke draws itself clearly first,
 * the hero content fades in over it, then the wordmark fades and sinks
 * ~52px down into the background, pauses, and loops.
 * Pure SVG + CSS, pointer-events-none, aria-hidden.
 */
export function HeroWordmark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-[58%] flex justify-center overflow-visible select-none"
    >
      <div className="wordmark-sink">
        <svg
          viewBox="0 0 1200 420"
          className="w-[150vw] sm:w-[110vw] md:w-[70vw] max-w-none opacity-70 dark:opacity-90"
          fill="none"
        >
          <defs>
            <linearGradient id="wordmark-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0E5B34" />
              <stop offset="100%" stopColor="#C09A4A" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="wordmark-stroke font-sans"
            style={{ fontSize: 340, fontWeight: 700 }}
            stroke="url(#wordmark-gradient)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          >
            إنصاف
          </text>
        </svg>
      </div>
    </div>
  );
}
