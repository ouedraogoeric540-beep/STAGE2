import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';

export default function AlerteModal({ isOpen, onClose, evenementId }) {
  const { isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }
    setLoading(true);
    try {
      await api.post('/agent/alerte', { message: message.trim(), evenement_id: evenementId });
      toast.success('Alerte envoyée à l\'organisateur !');
      setMessage('');
      onClose();
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: 400,
        background: isDark ? '#1e293b' : '#fff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: 16, overflow: 'hidden',
        animation: 'slideUpFade 0.3s ease'
      }}>
        <div style={{ background: '#ef4444', padding: '16px 20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 20 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Signaler un problème</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Décrivez le problème
          </label>
          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Problème technique à la porte A, incident avec un participant..."
            rows={4}
            style={{
              width: '100%', padding: 12, borderRadius: 10,
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              background: isDark ? '#0f172a' : '#f8fafd',
              color: 'var(--text-primary)', outline: 'none', resize: 'none',
              marginBottom: 20
            }}
          />
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn" 
              style={{ background: isDark ? '#334155' : '#e2e8f0', color: 'var(--text-primary)' }}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ background: '#ef4444', color: '#fff', border: 'none' }}
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'Envoyer l\'alerte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
