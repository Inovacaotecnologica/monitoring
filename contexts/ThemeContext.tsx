import React, { createContext, useState, useEffect, useContext } from 'react';

interface ThemeContextProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with a default theme on the server to prevent hydration mismatches.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // After mount, read the persisted theme from localStorage and update state. This effect
  // runs only on the client. By deferring the read to the client, server and client will
  // render the same initial theme (light) and avoid hydration warnings. If a stored
  // theme exists, it will be applied immediately after mount.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored as 'light' | 'dark');
      }
    }
  }, []);

  // Whenever the theme changes, update the document classes and persist the new value.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove the opposite class if present
      document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);