import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlertsStore, AlertRecord } from '../hooks/useAlertsStore';
import { useDevicesStore } from '../hooks/useDevicesStore';
import { useI18n } from '../contexts/I18nContext';
import { useUser } from '../contexts/UserContext';

/**
 * Alerts/alarms page. Displays all alerts with ability to resolve them.
 */
export default function AlertsPage() {
  const { t } = useI18n();
  const alerts = useAlertsStore((state) => state.alerts);
  const addAlert = useAlertsStore((state) => state.addAlert);
  const resolveAlert = useAlertsStore((state) => state.resolveAlert);
  const devices = useDevicesStore((state) => state.devices);
  const { user } = useUser();
  const router = useRouter();

  // Redirect to login if user not authenticated
  useEffect(() => {
    if (!user || !user.token) {
      router.push('/login');
    }
  }, [user, router]);

  // Seed demo alerts if none exist and demo flag enabled
  useEffect(() => {
    const demo = process.env.NEXT_PUBLIC_DEMO === 'true';
    if (!demo || alerts.length > 0) return;
    const now = Date.now();
    const demoAlerts: AlertRecord[] = [
      {
        id: 'alert1',
        deviceId: 'demo1',
        deviceName: 'Reservatório Demo',
        message: 'Nível abaixo de 20%',
        status: 'active',
        timestamp: now - 1000 * 60 * 10,
      },
      {
        id: 'alert2',
        deviceId: 'demo2',
        deviceName: 'Válvula Demo',
        message: 'Falha de comunicação',
        status: 'resolved',
        timestamp: now - 1000 * 60 * 60,
      },
    ];
    demoAlerts.forEach(addAlert);
  }, [alerts, addAlert]);

  // Helper to get device name by id for dynamic alerts; fallback to id
  const getDeviceName = (id: string) => {
    const dev = devices.find((d) => d.id === id);
    return dev ? dev.name : id;
  };

  return (
    <div>
      <h1>{t('alerts')}</h1>
      <div className="card" style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>{t('device_name')}</th>
              <th>{t('alerts')}</th>
              <th>{t('status')}</th>
              <th>{t('last_read')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {/* Filtrar alertas pela empresa selecionada */}
            {(() => {
              const companyDeviceIds = user?.selectedCompany
                ? devices.filter((d) => d.company === user.selectedCompany).map((d) => d.id)
                : devices.map((d) => d.id);
              const companyAlerts = alerts.filter((alert) => companyDeviceIds.includes(alert.deviceId));
              if (companyAlerts.length === 0) {
                return (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                      {t('no_devices')}
                    </td>
                  </tr>
                );
              }
              return companyAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{getDeviceName(alert.deviceId)}</td>
                  <td>{alert.message}</td>
                  <td>{t(alert.status)}</td>
                  <td>{new Date(alert.timestamp).toLocaleString()}</td>
                  <td>
                    {alert.status === 'active' ? (
                      <button
                        className="button"
                        onClick={() => resolveAlert(alert.id)}
                        style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
                      >
                        {t('resolve')}
                      </button>
                    ) : (
                      <span className="badge-online">{t('resolved')}</span>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}