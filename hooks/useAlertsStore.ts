import { create } from 'zustand';

export interface AlertRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  status: 'active' | 'resolved';
  timestamp: number;
}

interface AlertsState {
  alerts: AlertRecord[];
  addAlert: (alert: AlertRecord) => void;
  resolveAlert: (id: string) => void;
  clearAlerts: () => void;
}

/**
 * Zustand store for managing alerts/alarms. Alerts can be added by threshold rules
 * or manually and resolved later.
 */
export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),
  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)),
    })),
  clearAlerts: () => set({ alerts: [] }),
}));