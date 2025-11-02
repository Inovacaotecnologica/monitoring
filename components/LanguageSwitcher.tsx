import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useI18n();
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as 'pt' | 'es' | 'en')}
      style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}
    >
      <option value="pt"><span suppressHydrationWarning>{t('portuguese')}</span></option>
      <option value="es"><span suppressHydrationWarning>{t('spanish')}</span></option>
      <option value="en"><span suppressHydrationWarning>{t('english')}</span></option>
    </select>
  );
};

export default LanguageSwitcher;