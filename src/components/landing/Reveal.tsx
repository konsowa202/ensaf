'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
}

/**
 * One-way scroll-reveal wrapper. Bulletproof:
 * - reveals immediately if already in/near the viewport on mount
 * - hard fallback: reveals 1200ms after mount no matter what
 * - prefers-reduced-motion: visible from the start
 */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const show = () => setVisible(true);

    // Immediate check: already in or near the viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.05 && rect.bottom > 0) {
      show();
      return;
    }

    // Hard fallback: never leave content hidden
    const fallback = window.setTimeout(show, 1200);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show();
              window.clearTimeout(fallback);
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.01, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(el);
    }

    return () => {
      window.clearTimeout(fallback);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
