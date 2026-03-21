import { useEffect, useState } from 'react';

interface DeviceOrientation {
  beta: number | null;  // Front-to-back tilt (-180 to 180)
  gamma: number | null; // Left-to-right tilt (-90 to 90)
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    beta: 0,
    gamma: 0,
  });
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    // Request permission on iOS 13+
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceOrientationEvent as any).requestPermission();
          setPermission(permissionState);
          if (permissionState !== 'granted') return;
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
          return;
        }
      } else {
        setPermission('granted');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        beta: event.beta,
        gamma: event.gamma,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permission]);

  return { orientation, permission };
};
