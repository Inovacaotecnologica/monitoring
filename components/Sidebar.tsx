import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useI18n } from '../contexts/I18nContext';
import { useUser } from '../contexts/UserContext';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { t } = useI18n();
  const navItems = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/devices', label: t('devices') },
    { href: '/alerts', label: t('alerts') },
    { href: '/settings', label: t('settings') },
  ];

  // Load companies from user context. When there are multiple companies,
  // display them in a separate list. Clicking a company filters devices
  // to that company.
  const { user, setSelectedCompany } = useUser();

  return (
    <aside
      style={{
        width: '240px',
        padding: '1rem',
        borderRight: '1px solid var(--card-border)',
        backgroundColor: 'var(--card-bg)',
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const active = router.pathname.startsWith(item.href);
            return (
              <li key={item.href} style={{ marginBottom: '0.5rem' }}>
                <Link href={item.href} passHref legacyBehavior>
                  <a
                    style={{
                      display: 'block',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      backgroundColor: active ? 'var(--primary-color)' : 'transparent',
                      color: active ? '#ffffff' : 'var(--text-color)',
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Lista de empresas */}
        {user?.companies && user.companies.length > 1 && (
          <>
            <hr style={{ margin: '1rem 0', borderColor: 'var(--card-border)' }} />
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--text-color)', fontWeight: 600 }}>
              {t('companies')}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {user.companies.map((company) => {
                const activeCompany = user.selectedCompany === company;
                return (
                  <li key={company} style={{ marginBottom: '0.25rem' }}>
                    <a
                      role="button"
                      onClick={() => {
                        setSelectedCompany(company);
                        // Navigate to devices page when company changes
                        router.push('/devices');
                      }}
                      style={{
                        display: 'block',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: activeCompany ? 'var(--primary-color)' : 'transparent',
                        color: activeCompany ? '#ffffff' : 'var(--text-color)',
                        cursor: 'pointer',
                      }}
                    >
                      {company}
                    </a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;