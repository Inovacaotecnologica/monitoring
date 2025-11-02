import { create } from 'zustand';

export type DeviceType = 'reservatorio' | 'valvula' | 'sensor';

export interface DeviceRecord {
  id: string;
  /**
   * Friendly name displayed to users.
   */
  name: string;
  /**
   * Device category: reservatorio (tank), valvula (valve) or sensor.
   */
  type: DeviceType;
  /**
   * Communication protocol for the device. Determines how to fetch/push data.
   */
  protocol: 'http' | 'ws' | 'mqtt';
  /**
   * HTTP endpoint (if protocol === 'http'). Should include full base URL and route.
   */
  endpoint?: string;
  /**
   * WebSocket channel or room (if protocol === 'ws').
   */
  wsChannel?: string;
  /**
   * MQTT topic used to subscribe for telemetry/state and publish commands (if protocol === 'mqtt').
   */
  mqttTopic?: string;
  /**
   * Latest level value received from the device. Null if not available yet.
   */
  level: number | null;
  /**
   * Connection status: online/offline. Use to display connection badge.
   */
  status: string;
  /**
   * Optional tags used for filtering.
   */
  tags?: string[];
  /**
   * Optional threshold configuration for alarms. Structure depends on device type.
   */
  thresholds?: Record<string, any>;
  /**
   * Image path to display in cards and lists.
   */
  image: string;
  /**
   * Timestamp of creation (epoch ms). Useful for sorting and auditing.
   */
  createdAt?: number;
  /**
   * Timestamp of last update (epoch ms). Useful for sorting and auditing.
   */
  updatedAt?: number;

  /**
   * Optional company to which this device belongs. Used to filter devices by user.
   */
  company?: string;

  /**
   * Power state of the device. True means the device is turned on, false
   * means turned off. When undefined the device does not support power
   * control.
   */
  power?: boolean;
}

interface DevicesState {
  devices: DeviceRecord[];
  addDevice: (device: DeviceRecord) => void;
  updateDevice: (device: DeviceRecord) => void;
  removeDevice: (id: string) => void;
  setDevices: (devices: DeviceRecord[]) => void;

  /**
   * Toggle the power state of a device. If the device has a power field,
   * this will flip its boolean value. Use this to simulate on/off commands.
   */
  togglePower: (id: string) => void;

  /**
   * Explicitly set the power state of a device. Useful when receiving
   * updates from the server.
   */
  setPower: (id: string, state: boolean) => void;
}

export const useDevicesStore = create<DevicesState>((set) => ({
  devices: [],
  addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
  updateDevice: (device) =>
    set((state) => ({
      devices: state.devices.map((d) => (d.id === device.id ? device : d)),
    })),
  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    })),
  setDevices: (devices) => set(() => ({ devices })),

  togglePower: (id) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id && typeof d.power === 'boolean'
          ? { ...d, power: !d.power }
          : d
      ),
    })),

  setPower: (id, stateValue) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, power: stateValue } : d
      ),
    })),
}));