import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * Theme provider that persists the user's dashboard theme preference.
 * NOTE: The theme attribute is applied ONLY to the dashboard layout wrapper
 * (MainLayout), not to <html>. This ensures Landing/Login pages keep their
 * own fixed dark design regardless of the user's dashboard theme choice.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored =
        typeof window !== 'undefined' && window.localStorage.getItem('cg-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Ignore storage errors
    }
    return 'dark'; // Default dashboard theme
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Persist to localStorage whenever theme changes
  useEffect(() => {
    try {
      window.localStorage.setItem('cg-theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
