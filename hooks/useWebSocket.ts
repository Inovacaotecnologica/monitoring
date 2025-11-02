import { useEffect } from 'react';
import { useDevicesStore } from './useDevicesStore';

// Hook para conectar a um WebSocket customizado e atualizar devices.
export const useWebSocketClient = () => {
  const setDevices = useDevicesStore((state) => state.setDevices);
  const devices = useDevicesStore((state) => state.devices);
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;
    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
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
          console.warn('Erro ao processar mensagem WS', err);
        }
      };
    } catch (err) {
      console.error('Falha ao conectar WebSocket', err);
    }
    return () => {
      if (socket) socket.close();
    };
  }, [setDevices, devices]);
};