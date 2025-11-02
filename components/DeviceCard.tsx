import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useDevicesStore } from '../hooks/useDevicesStore';

export interface Device {
  id: string;
  name: string;
  type: string;
  level?: number | null;
  status?: string;
  image?: string;
  /**
   * Optional power state; true = on, false = off. When undefined the device
   * cannot be controlled via power buttons.
   */
  power?: boolean;
}

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick }) => {
  const { t } = useI18n();
  const { togglePower } = useDevicesStore();
  const level = device.level;
  const status = device.status || 'offline';
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {device.image && (
        <img
          src={device.image}
          alt={device.name}
          style={{ width: '100%', height: '140px', objectFit: 'contain', marginBottom: '0.5rem' }}
        />
      )}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{device.name}</h3>
      <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-color)' }}>
        {device.type}
      </p>
      {level != null && level !== undefined ? (
        <>
          <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>{level.toFixed(1)}%</div>
          <div style={{ width: '100%', height: '8px', background: 'var(--card-border)', borderRadius: '0.25rem' }}>
            <div
              style={{
                width: `${level}%`,
                height: '8px',
                background: 'var(--primary-color)',
                borderRadius: '0.25rem',
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>{t('last_read')}: --</div>
      )}
      <div style={{ marginTop: '0.5rem' }}>
        {status.toLowerCase() === 'online' ? (
          <span className="badge-online">{t('online')}</span>
        ) : status.toLowerCase() === 'offline' ? (
          <span className="badge-offline">{t('offline')}</span>
        ) : (
          <span className="badge-offline">{status}</span>
        )}
      </div>
      {/* Botão de liga/desliga se o dispositivo suportar power */}
      {typeof device.power === 'boolean' && (
        <button
          type="button"
          className="button"
          style={{ marginTop: '0.5rem', width: '100%' }}
          onClick={(e) => {
            e.stopPropagation();
            togglePower(device.id);
          }}
        >
          {device.power ? t('power_off') : t('power_on')}
        </button>
      )}
    </div>
  );
};

export default DeviceCard;