import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useDevicesStore } from '../../hooks/useDevicesStore';
import { useI18n } from '../../contexts/I18nContext';
import { useUser } from '../../contexts/UserContext';

/**
 * Devices list page. Displays all devices in a table with filter and delete actions.
 */
export default function DevicesPage() {
  const { t } = useI18n();
  const devices = useDevicesStore((state) => state.devices);
  const removeDevice = useDevicesStore((state) => state.removeDevice);
  const togglePower = useDevicesStore((state) => state.togglePower);
  const { user } = useUser();

  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !user.token) {
      router.push('/login');
    }
  }, [user, router]);
  const [query, setQuery] = useState('');

  // Filter devices by selected company (if any)
  const companyFiltered = user?.selectedCompany
    ? devices.filter((d) => d.company === user.selectedCompany)
    : devices;

  const filtered = companyFiltered.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>{t('devices')}</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          style={{ padding: '0.5rem', width: '100%', maxWidth: '300px', borderRadius: '0.25rem', border: '1px solid var(--card-border)' }}
        />
      </div>
      {filtered.length === 0 ? (
        <div>{t('no_devices')}</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{t('device_name')}</th>
                <th>{t('device_type')}</th>
                <th>{t('protocol')}</th>
                <th>{t('status')}</th>
                <th>{t('control')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id}>
                  <td>
                    <Link href={`/devices/${device.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      {device.name}
                    </Link>
                  </td>
                  <td>{device.type}</td>
                  <td>{device.protocol}</td>
                  <td>{device.status}</td>
                  <td>
                    {typeof device.power === 'boolean' ? (
                      <button
                        className="button"
                        onClick={() => togglePower(device.id)}
                      >
                        {device.power ? t('power_off') : t('power_on')}
                      </button>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td>
                    <button
                      className="button"
                      style={{ backgroundColor: 'var(--error-color)', color: 'white' }}
                      onClick={() => {
                        const confirm = window.confirm(t('confirm_delete'));
                        if (confirm) removeDevice(device.id);
                      }}
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}