import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useI18n } from '../contexts/I18nContext';
import KpiCard from '../components/KpiCard';
import ChartRealtime from '../components/ChartRealtime';
import DeviceCard from '../components/DeviceCard';
import AddDeviceDialog from '../components/AddDeviceDialog';
import { useDevicesStore } from '../hooks/useDevicesStore';
import { useUser } from '../contexts/UserContext';
import { useMqttClient } from '../hooks/useMqttClient';
import { useWebSocketClient } from '../hooks/useWebSocket';
import { useHttpPolling } from '../hooks/useHttpPolling';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const devices = useDevicesStore((state) => state.devices);
  const addDevice = useDevicesStore((state) => state.addDevice);
  const setDevices = useDevicesStore((state) => state.setDevices);

  // Currently authenticated user; used to filter devices by company
  const { user } = useUser();

  // Redirect to login if no authenticated user (no token)
  useEffect(() => {
    // If user token is missing, redirect to login page
    if (!user || !user.token) {
      router.push('/login');
    }
  }, [user, router]);

  const [showAdd, setShowAdd] = useState(false);
  const [chartData, setChartData] = useState<{ ts: number; value: number }[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Hooks de tempo real (ativam se env vars definidos)
  useMqttClient();
  useWebSocketClient();
  useHttpPolling();

  // Inicializa dispositivos de demonstração se modo demo estiver habilitado
  useEffect(() => {
    const demo = process.env.NEXT_PUBLIC_DEMO === 'true';
    if (!demo) return;
    const initial = [
      {
        id: 'demo1',
        name: 'Reservatório Demo',
        type: 'reservatorio',
        protocol: 'mqtt',
        mqttTopic: 'site/torreA/andar3/demo1/telemetry',
        level: 70,
        status: 'online',
        image: '/images/water_tank.png',
      },
      {
        id: 'demo2',
        name: 'Válvula Demo',
        type: 'valvula',
        protocol: 'http',
        endpoint: 'http://localhost:3001/devices/demo2',
        level: 40,
        status: 'offline',
        image: '/images/valve.png',
      },
      {
        id: 'demo3',
        name: 'Sensor Demo',
        type: 'sensor',
        protocol: 'ws',
        wsChannel: 'demo3',
        level: 55,
        status: 'online',
        image: '/images/sensor_board.png',
      },
    ];
    if (devices.length === 0) setDevices(initial as any);
  }, [devices, setDevices]);

  // Atualiza dados do gráfico quando nível do primeiro dispositivo mudar
  useEffect(() => {
    // Use only devices belonging to the selected company when building chart
    const filtered = user?.selectedCompany
      ? devices.filter((d) => d.company === user.selectedCompany)
      : devices;
    if (filtered.length === 0) return;
    const primary = filtered[0];
    if (primary.level != null) {
      setChartData((prev) => [
        ...prev.slice(-19),
        { ts: Date.now(), value: primary.level || 0 },
      ]);
      setLastSync(new Date());
    }
  }, [devices]);

  // KPI calculations
  // Use the existing `user` destructured above. Do not redeclare it here to avoid a duplicate definition.
  const filteredDevices = user?.selectedCompany
    ? devices.filter((d) => d.company === user.selectedCompany)
    : devices;
  const totalDevices = filteredDevices.length;
  const onlineDevices = filteredDevices.filter((d) => d.status === 'online').length;
  const activeAlarms = 0; // placeholder; integrate with alerts
  const lastSyncStr = lastSync ? lastSync.toLocaleTimeString() : '--';

  // Determine if the Add Device button should be enabled based on the user's
  // maxDevices limit. Count devices only in the selected company.
  const maxDevices = user?.maxDevices;
  const canAddDevice = typeof maxDevices === 'number' ? filteredDevices.length < maxDevices : true;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <KpiCard label={t('kpi_total_devices')} value={totalDevices} />
        <KpiCard label={t('kpi_online_devices')} value={onlineDevices} />
        <KpiCard label={t('kpi_active_alarms')} value={activeAlarms} />
        <KpiCard label={t('kpi_last_sync')} value={lastSyncStr} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <ChartRealtime data={chartData} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2>{t('devices')}</h2>
          <button className="button" onClick={() => setShowAdd(true)} disabled={!canAddDevice}>
            {t('add_device')}
          </button>
          {!canAddDevice && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--badge-bg-offline)' }}>{t('device_limit_reached')}</span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device as any}
              onClick={() => router.push(`/devices/${device.id}`)}
            />
          ))}
        </div>
      </div>
      <AddDeviceDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(device) => {
          addDevice(device as any);
        }}
      />
    </div>
  );
}