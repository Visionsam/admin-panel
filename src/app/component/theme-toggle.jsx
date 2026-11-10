'use client';

import React, { useEffect, useState } from 'react';
// Round sun/moon button. Styles: `.theme-toggle-btn` in globals.css (globals-theme-toggle.css).
// Toggles the `.dark` class on <html> (what your Tailwind `dark` variant and variables use)
// and remembers the choice in localStorage ("theme").
// If your old ThemeSwitcher used a provider (e.g. next-themes), keep its logic and only reuse the markup below.

export default function ThemeSwitcher() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch {}
    const isDark = saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', isDark);
    setDark(isDark);
    setReady(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      title={dark ? 'Light mode' : 'Dark mode'}
      data-ready={ready}
    >
      {/* sun */}
      <svg className="theme-toggle-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      {/* moon */}
      <svg className="theme-toggle-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}