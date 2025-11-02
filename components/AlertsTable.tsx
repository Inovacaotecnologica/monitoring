import React from 'react';
import { useI18n } from '../contexts/I18nContext';

export interface Alert {
  id: string;
  deviceName: string;
  message: string;
  timestamp: number;
  status: 'active' | 'resolved';
}

interface AlertsTableProps {
  alerts: Alert[];
}

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  const { t } = useI18n();
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>{t('device_name')}</th>
            <th>{t('alerts')}</th>
            <th>{t('status')}</th>
            <th>{t('last_read')}</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.deviceName}</td>
              <td>{alert.message}</td>
              <td>
                {alert.status === 'active' ? (
                  <span className="badge-offline">{t('alerts')}</span>
                ) : (
                  <span className="badge-online">{t('online')}</span>
                )}
              </td>
              <td>{new Date(alert.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;