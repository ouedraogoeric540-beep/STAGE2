const DB_NAME = 'SecurePassDB';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(event.target.error);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for downloaded tickets (to check validity offline)
      if (!db.objectStoreNames.contains('tickets')) {
        // We use qr_code as keyPath
        db.createObjectStore('tickets', { keyPath: 'qr_code' });
      }

      // Store for offline scans waiting to be synced
      if (!db.objectStoreNames.contains('offline_scans')) {
        db.createObjectStore('offline_scans', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const clearTickets = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tickets'], 'readwrite');
    const store = transaction.objectStore('tickets');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

export const saveTickets = async (tickets) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tickets'], 'readwrite');
    const store = transaction.objectStore('tickets');
    
    // Clear old ones maybe? Best is to clear before saving if we only support one active event at a time, 
    // but maybe they scan for multiple events. Let's just put them in.
    
    tickets.forEach(ticket => {
      // Store uppercase version too if needed for manual entry, but the controller handles it.
      // We will store both 'qr_code' and 'code_unique' as searchable if we needed, 
      // but let's just make 'qr_code' the key and search by it.
      store.put(ticket);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e.target.error);
  });
};

export const getTicketByQR = async (qr) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tickets'], 'readonly');
    const store = transaction.objectStore('tickets');
    
    // Check by qr_code
    const request = store.get(qr);
    
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        // If not found by qr_code, try to find by code_unique (full table scan since it's small)
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const upperQR = qr.toUpperCase();
          const found = allReq.result.find(t => t.code_unique === upperQR);
          resolve(found || null);
        };
        allReq.onerror = (e) => reject(e.target.error);
      }
    };
    request.onerror = (e) => reject(e.target.error);
  });
};

export const updateTicketLocalStatus = async (qr, newStatus) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tickets'], 'readwrite');
    const store = transaction.objectStore('tickets');
    
    getTicketByQR(qr).then(ticket => {
      if (ticket) {
        ticket.statut = newStatus;
        store.put(ticket);
        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(reject);
  });
};

export const saveOfflineScan = async (scanData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_scans'], 'readwrite');
    const store = transaction.objectStore('offline_scans');
    const request = store.add(scanData);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};

export const getOfflineScans = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_scans'], 'readonly');
    const store = transaction.objectStore('offline_scans');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const clearOfflineScans = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offline_scans'], 'readwrite');
    const store = transaction.objectStore('offline_scans');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
};
