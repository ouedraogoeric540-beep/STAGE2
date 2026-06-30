import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function NotificationBell() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch real alerts
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // On suppose que la route est /alertes (à ajuster par le backend si besoin)
    api.get('/alertes')
      .then(res => {
        setNotifications(res.data || []);
      })
      .catch(err => {
        console.error("Erreur chargement alertes", err);
        setNotifications([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      // On suppose que la route pour marquer comme lu est /alertes/read
      await api.post('/alertes/read');
    } catch (err) {
      console.error("Erreur API lors du marquage, mise à jour locale", err);
    } finally {
      // Met à jour l'affichage quoiqu'il arrive
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: '50%',
          transition: 'background 0.2s', outline: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="bi bi-bell" style={{ fontSize: 18 }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#ef4444', border: `2px solid var(--bg-card)`
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: -10, marginTop: 10,
          width: 320, backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: 'var(--shadow-lg)',
          zIndex: 1000, animation: 'slideUp 0.2s ease',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                {unreadCount} nouvelle(s)
              </span>
            )}
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <i className="bi bi-bell-slash" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ 
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: !n.is_read ? (isDark ? 'rgba(13,110,253,0.05)' : '#f8fafd') : 'transparent',
                  display: 'flex', gap: 12, cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !n.is_read ? (isDark ? 'rgba(13,110,253,0.05)' : '#f8fafd') : 'transparent'}
                >
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: !n.is_read ? 700 : 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {n.evenement?.titre ? `Alerte - ${n.evenement.titre}` : 'Nouvelle Alerte'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 4 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(n.created_at || Date.now()).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div style={{ padding: 10, textAlign: 'center', borderTop: '1px solid var(--border)' }}>
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#0D6EFD', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
