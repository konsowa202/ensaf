'use client';

import { useEffect } from 'react';

// Syncs the theme between localStorage (legacy), the `theme` cookie
// (used by the server layout to render the `dark` class), and the DOM.
// Renders nothing — safe on every page.
export function ThemeSync() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      const cookieMatch = document.cookie.match(/(?:^|;\s*)theme=(dark|light)/);
      const cookieTheme = cookieMatch?.[1];

      // First visit ever: fall back to the OS preference
      const theme =
        stored ||
        cookieTheme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      document.documentElement.classList.toggle('dark', theme === 'dark');

      // Persist everywhere so the server renders the right class next time
      if (stored !== theme) localStorage.setItem('theme', theme);
      if (cookieTheme !== theme) {
        document.cookie = `theme=${theme};path=/;max-age=31536000;samesite=lax`;
      }
    } catch {}
  }, []);

  return null;
}
