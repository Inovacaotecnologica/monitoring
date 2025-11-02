import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="button"
      style={{ fontSize: '0.875rem' }}
    >
      {/* Wrap the emoji in a span with suppressHydrationWarning to prevent hydration errors
          when the client-side theme differs from the server-rendered default. */}
      <span suppressHydrationWarning>{theme === 'light' ? '🌞' : '🌙'}</span>
    </button>
  );
};

export default ThemeToggle;