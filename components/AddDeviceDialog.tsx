import React, { useState } from 'react';
import { Device } from './DeviceCard';
import { useI18n } from '../contexts/I18nContext';
import { useUser } from '../contexts/UserContext';
import { useDevicesStore } from '../hooks/useDevicesStore';

interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (device: Device) => void;
}

// Um formulário simples para adicionar um novo dispositivo.
const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({ open, onClose, onSave }) => {
  const { t } = useI18n();
  const { user } = useUser();
  const devices = useDevicesStore((state) => state.devices);
  const [name, setName] = useState('');
  const [type, setType] = useState('reservatorio');
  const [protocol, setProtocol] = useState('http');
  const [endpoint, setEndpoint] = useState('');
  const [mqttTopic, setMqttTopic] = useState('');
  const [wsChannel, setWsChannel] = useState('');
  const [company, setCompany] = useState<string | undefined>(user?.selectedCompany || user?.companies?.[0]);

  // Determine whether the user is allowed to add another device. If the user has
  // defined a maxDevices limit, count the existing devices for the selected
  // company and disable the save button if the limit is reached.
  const maxDevices = user?.maxDevices;
  const existingCount = devices.filter((d) => d.company === company).length;
  const canAddDevice = typeof maxDevices === 'number' ? existingCount < maxDevices : true;

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If device limit reached, do not proceed
    if (!canAddDevice) {
      return;
    }
    const id = Date.now().toString();
    // Build a new device record. Include protocol and protocol-specific fields.
    const image =
      type === 'reservatorio'
        ? '/images/water_tank.png'
        : type === 'valvula'
        ? '/images/valve.png'
        : '/images/sensor_board.png';
    const newDevice: Device = {
      id,
      name,
      type: type as any,
      protocol: protocol as any,
      level: null,
      status: 'offline',
      image,
      company,
      power: false,
      // Add protocol-specific fields only when provided
      ...(protocol === 'http' && endpoint ? { endpoint } : {}),
      ...(protocol === 'ws' && wsChannel ? { wsChannel } : {}),
      ...(protocol === 'mqtt' && mqttTopic ? { mqttTopic } : {}),
    } as any;
    onSave(newDevice);
    // Reset fields for next addition
    setName('');
    setType('reservatorio');
    setProtocol('http');
    setEndpoint('');
    setMqttTopic('');
    setWsChannel('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 style={{ marginBottom: '1rem' }}>{t('add_device')}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              {t('device_name')}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              {t('device_type')}
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginLeft: '0.5rem' }}>
                <option value="reservatorio">Reservatório</option>
                <option value="valvula">Válvula</option>
                <option value="sensor">Sensor</option>
              </select>
            </label>
          </div>
          {/* Seleção de empresa */}
          {user?.companies && user.companies.length > 1 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                {t('select_company')}
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {user.companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Protocolo
              <select value={protocol} onChange={(e) => setProtocol(e.target.value)} style={{ marginLeft: '0.5rem' }}>
                <option value="http">HTTP</option>
                <option value="ws">WebSocket</option>
                <option value="mqtt">MQTT</option>
              </select>
            </label>
          </div>
          {/* Campos dinâmicos conforme o protocolo */}
          {protocol === 'http' && (
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Endpoint
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="http://host:porta/rota"
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            </div>
          )}
          {protocol === 'ws' && (
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Canal WS
                <input
                  type="text"
                  value={wsChannel}
                  onChange={(e) => setWsChannel(e.target.value)}
                  placeholder="canal/dispositivo"
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            </div>
          )}
          {protocol === 'mqtt' && (
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Tópico MQTT
                <input
                  type="text"
                  value={mqttTopic}
                  onChange={(e) => setMqttTopic(e.target.value)}
                  placeholder="predio/andar/dispositivo/telemetry"
                  style={{ marginLeft: '0.5rem' }}
                />
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="button" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="button" disabled={!canAddDevice}>
              {t('save')}
            </button>
          </div>
        {!canAddDevice && (
          <p style={{ color: 'var(--badge-bg-offline)', marginTop: '0.5rem' }}>
            {t('device_limit_reached')}
          </p>
        )}
        </form>
      </div>
    </div>
  );
};

export default AddDeviceDialog;