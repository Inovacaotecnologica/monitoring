import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useI18n } from '../contexts/I18nContext';

const Header: React.FC = () => {
  const { t } = useI18n();
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Monitoramento Predial</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;