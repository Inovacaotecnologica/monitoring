import { useEffect } from 'react';
import mqtt from 'mqtt';
import { useDevicesStore } from './useDevicesStore';

// Hook para conectar ao broker MQTT via WebSocket e atualizar o estado dos dispositivos.
export const useMqttClient = () => {
  const setDevices = useDevicesStore((state) => state.setDevices);
  const devices = useDevicesStore((state) => state.devices);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
    if (!url) return;
    let client: mqtt.MqttClient | null = null;
    try {
      client = mqtt.connect(url);
      client.on('connect', () => {
        const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || 'predio/+/+/+/telemetry';
        client?.subscribe(topic, { qos: 0 });
      });
      client.on('message', (_topic: string, message: Buffer) => {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.device_id && payload.nivel_pct != null) {
            setDevices(
              devices.map((d) =>
                d.id === payload.device_id
                  ? { ...d, level: payload.nivel_pct, status: 'online' }
                  : d
              )
            );
          }
        } catch (err) {
          console.warn('Erro ao parsear payload MQTT', err);
        }
      });
    } catch (err) {
      console.error('Falha ao conectar MQTT', err);
    }
    return () => {
      if (client) client.end();
    };
  }, [setDevices, devices]);
};