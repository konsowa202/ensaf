import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  /** Render without the cream seal frame (e.g. on light backgrounds only). */
  bare?: boolean;
}

export function Logo({ className = '', bare = false }: LogoProps) {
  // The wordmark lives inside the image. In light mode it sits on a subtle cream seal.
  // In dark mode it seamlessly blends into the dark palette with inverted calligraphy.
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={
          bare
            ? 'relative flex items-center justify-center w-32 h-12'
            : 'relative flex items-center justify-center h-12 px-4 rounded-2xl bg-[#FDFCF9] dark:bg-emerald-950/40 border border-[#0E5B34]/15 dark:border-emerald-500/30 shadow-xs dark:shadow-none transition-colors'
        }
      >
        <div className="relative w-28 h-9">
          <Image
            src="/logo.png"
            alt="INSAF Logo"
            fill
            className="object-contain dark:brightness-0 dark:invert transition-all"
            priority
          />
        </div>
      </div>
    </div>
  );
}
