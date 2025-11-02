import { useState } from 'react';
import { useRouter } from 'next/router';
import { useI18n } from '../contexts/I18nContext';
import { useUser } from '../contexts/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          // Persist user token and companies via context. Limit the companies list to
          // `maxCompanies` if provided. Also store `maxDevices` on the user object
          // so the UI can enforce device creation limits.
          const companiesRaw: string[] = Array.isArray(data.companies) ? data.companies : [];
          const maxCompanies: number | undefined = typeof data.maxCompanies === 'number' ? data.maxCompanies : undefined;
          const allowedCompanies = maxCompanies
            ? companiesRaw.slice(0, maxCompanies)
            : companiesRaw;
          const selectedCompany = allowedCompanies.length > 0 ? allowedCompanies[0] : null;
          setUser({
            token: data.token,
            email,
            companies: allowedCompanies,
            selectedCompany,
            maxCompanies,
            maxDevices: typeof data.maxDevices === 'number' ? data.maxDevices : undefined,
          });
          router.push('/dashboard');
          return;
        }
      }
      setError(t('invalid_credentials') ?? 'Credenciais inválidas');
    } catch (err) {
      setError(t('auth_error') ?? 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('login')}</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              {t('email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ marginLeft: '0.5rem', width: '100%' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              {t('password')}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ marginLeft: '0.5rem', width: '100%' }}
              />
            </label>
          </div>
          {error && <p style={{ color: 'var(--badge-bg-offline)', marginBottom: '0.5rem' }}>{error}</p>}
          <button type="submit" className="button" disabled={loading} style={{ width: '100%' }}>
            {t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
}