import { useEffect } from 'react';
import { useDevicesStore } from './useDevicesStore';

// Hook para consultar um endpoint HTTP em intervalos regulares e atualizar devices.
export const useHttpPolling = () => {
  const setDevices = useDevicesStore((state) => state.setDevices);
  const devices = useDevicesStore((state) => state.devices);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_HTTP_API_URL;
    if (!url) return;
    const fetchData = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.device_id && data.nivel_pct != null) {
          setDevices(
            devices.map((d) =>
              d.id === data.device_id
                ? { ...d, level: data.nivel_pct, status: 'online' }
                : d
            )
          );
        }
      } catch (err) {
        console.error('Erro no polling HTTP', err);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [setDevices, devices]);
};