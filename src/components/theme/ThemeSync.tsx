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

      // Default is light mode — dark only if the user explicitly chose it
      const theme = stored || cookieTheme || 'light';

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
