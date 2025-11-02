import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import Link from 'next/link';
import { useDevicesStore } from '../../hooks/useDevicesStore';
import { useI18n } from '../../contexts/I18nContext';
import ChartRealtime from '../../components/ChartRealtime';

/**
 * Device detail page. Shows info and live chart for a single device.
 */
export default function DeviceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();

  // Require authenticated user
  const { user } = useUser();

  const device = useDevicesStore((state) => state.devices.find((d) => d.id === id));
  const removeDevice = useDevicesStore((state) => state.removeDevice);
  const togglePower = useDevicesStore((state) => state.togglePower);
  const [data, setData] = useState<{ ts: number; value: number }[]>([]);

  useEffect(() => {
    if (!device) return;
    // Append new value to chart whenever level changes
    const interval = setInterval(() => {
      if (device && device.level != null) {
        setData((prev) => [...prev.slice(-19), { ts: Date.now(), value: device.level || 0 }]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [device]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user || !user.token) {
      router.push('/login');
    }
  }, [user, router]);

  if (!device) {
    return (
      <div>
        <h1>{t('device_details')}</h1>
        <p>{t('no_devices')}</p>
        <Link href="/devices" style={{ color: 'var(--primary-color)' }}>
          ← {t('devices')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/devices" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
        ← {t('devices')}
      </Link>
      <h1 style={{ marginTop: '1rem' }}>{device.name}</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div className="card" style={{ flex: '1 1 300px' }}>
          {device.image && (
            <img src={device.image} alt={device.name} style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '1rem' }} />
          )}
          <p><strong>{t('device_type')}:</strong> {device.type}</p>
          <p><strong>{t('protocol')}:</strong> {device.protocol}</p>
          {device.endpoint && <p><strong>Endpoint:</strong> {device.endpoint}</p>}
          {device.wsChannel && <p><strong>WS:</strong> {device.wsChannel}</p>}
          {device.mqttTopic && <p><strong>MQTT:</strong> {device.mqttTopic}</p>}
          {device.company && <p><strong>{t('company')}:</strong> {device.company}</p>}
          <p><strong>{t('status')}:</strong> {device.status}</p>
          {device.level != null && <p><strong>{t('level')}:</strong> {device.level.toFixed(1)}%</p>}
          {typeof device.power === 'boolean' && (
            <button
              className="button"
              style={{ marginTop: '0.5rem' }}
              onClick={() => togglePower(device.id)}
            >
              {device.power ? t('power_off') : t('power_on')}
            </button>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button
              className="button"
              style={{ backgroundColor: 'var(--error-color)', color: 'white' }}
              onClick={() => {
                const confirmDel = window.confirm(t('confirm_delete'));
                if (confirmDel) {
                  removeDevice(device.id);
                  router.push('/devices');
                }
              }}
            >
              {t('delete')}
            </button>
          </div>
        </div>
        <div className="card" style={{ flex: '2 1 400px' }}>
          <h3>{t('level')} (%)</h3>
          <ChartRealtime data={data} />
        </div>
      </div>
    </div>
  );
}