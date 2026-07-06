import { useState, useEffect } from 'react';
import axiosClient from '../api/axios';
import toast from 'react-hot-toast';

export default function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineScans();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineScans = async () => {
    const offlineScans = JSON.parse(localStorage.getItem('offlineScans') || '[]');
    if (offlineScans.length === 0) return;

    toast.loading('Synchronisation des scans hors-ligne...', { id: 'sync' });
    try {
      await axiosClient.post('/scan/sync', { scans: offlineScans });
      localStorage.removeItem('offlineScans');
      toast.success('Scans hors-ligne synchronisés !', { id: 'sync' });
    } catch (err) {
      console.error('Erreur lors de la synchronisation', err);
      toast.error('Échec de la synchronisation', { id: 'sync' });
    }
  };

  return { isOnline, syncOfflineScans };
}
