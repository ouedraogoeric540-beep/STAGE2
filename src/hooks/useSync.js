import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { getOfflineScans, clearOfflineScans } from '../utils/db';
import toast from 'react-hot-toast';

export const useSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronise les données locales avec le serveur
  const syncData = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      setIsSyncing(true);
      const scans = await getOfflineScans();
      
      if (scans && scans.length > 0) {
        // Envoi au serveur
        const response = await api.post('/scan/sync', { scans });
        
        if (response.data.synced_count !== undefined) {
          toast.success(`${response.data.synced_count} scans synchronisés !`, { icon: '🔄' });
          // Vider la file d'attente
          await clearOfflineScans();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      // On garde les scans dans la DB s'il y a une erreur réseau
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast('Retour en ligne. Synchronisation...', { icon: '📶' });
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('Mode hors ligne. Les scans seront sauvegardés localement.', { icon: '🚫' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Synchronisation initiale au montage si on est en ligne
    if (navigator.onLine) {
      syncData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  return { isOnline, isSyncing, syncData };
};
