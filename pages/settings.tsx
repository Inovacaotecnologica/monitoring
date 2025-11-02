import { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

/**
 * Settings page. Allows the user to change language, theme and other preferences.
 */
export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [interval, setIntervalVal] = useState(5000);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (!user || !user.token) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div>
      <h1>{t('settings_title')}</h1>
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2>{t('language')}</h2>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as any)}
          style={{ marginTop: '0.5rem', padding: '0.25rem' }}
        >
          <option value="pt"><span suppressHydrationWarning>{t('portuguese')}</span></option>
          <option value="es"><span suppressHydrationWarning>{t('spanish')}</span></option>
          <option value="en"><span suppressHydrationWarning>{t('english')}</span></option>
        </select>
      </div>
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2>{t('theme')}</h2>
        <div style={{ marginTop: '0.5rem' }}>
          <button className="button" onClick={() => toggleTheme()}>
            <span suppressHydrationWarning>{theme === 'light' ? t('dark') : t('light')}</span>
          </button>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2>{t('interval')}</h2>
        <input
          type="number"
          min="1000"
          step="1000"
          value={interval}
          onChange={(e) => setIntervalVal(parseInt(e.target.value))}
          style={{ marginTop: '0.5rem', padding: '0.25rem' }}
        />
        <small style={{ display: 'block', marginTop: '0.25rem' }}>
          {/* Changing interval here won't automatically reconfigure polling; it is a placeholder for future integration. */}
        </small>
      </div>
      <div className="card" style={{ marginTop: '1rem', padding: '1rem' }}>
        <h2>{t('timezone')}</h2>
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          style={{ marginTop: '0.5rem', padding: '0.25rem' }}
        />
        <small style={{ display: 'block', marginTop: '0.25rem' }}>
          {/* Timezone is used to format dates locally; editing has no effect on actual device timezone. */}
        </small>
      </div>
    </div>
  );
}