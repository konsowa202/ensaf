import React from 'react';

export function SaudiPatternBg({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40 dark:opacity-20 ${className}`}
      aria-hidden="true"
    >
      {/* Radial soft emerald glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#0E5B34]/15 via-[#C09A4A]/5 to-transparent rounded-full blur-3xl" />

      {/* Saudi Traditional Architectural & Geometric Pattern (Subtle SVG Overlay) */}
      <svg
        className="absolute w-full h-full text-[#C09A4A]/25"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
      >
        <defs>
          <pattern
            id="saudi-najdi-pattern"
            x="0"
            y="0"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            {/* Najdi triangular/rhombus traditional star motif */}
            <path
              d="M32 4 L42 22 L60 32 L42 42 L32 60 L22 42 L4 32 L22 22 Z"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeOpacity="0.4"
              fill="none"
            />
            <circle cx="32" cy="32" r="3" fill="currentColor" fillOpacity="0.2" />
            <path
              d="M0 32 H64 M32 0 V64"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 6"
              strokeOpacity="0.25"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#saudi-najdi-pattern)" />
      </svg>
    </div>
  );
}
