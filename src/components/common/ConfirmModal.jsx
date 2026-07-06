import { useTheme } from '../../context/ThemeContext'

export default function ConfirmModal({ isOpen, title, message, children, onConfirm, onCancel, confirmText = 'Supprimer', cancelText = 'Annuler', loading = false, isDanger = true }) {
  const { isDark } = useTheme()

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500, background: isDark ? '#1e2130' : '#fff', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 16, overflow: 'hidden', animation: 'slideUpFade 0.3s ease' }}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: isDanger ? '#fee2e2' : '#e0e7ff', color: isDanger ? '#ef4444' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className={`bi ${isDanger ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`} style={{ fontSize: 24 }} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          {message && <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>}
          {children && <div style={{ marginTop: 16, textAlign: 'left' }}>{children}</div>}
        </div>
        <div style={{ background: isDark ? '#1a1d2d' : '#f8fafc', padding: '16px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, borderRadius: 8, color: 'var(--text-secondary)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 16px', background: isDanger ? '#ef4444' : 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className={`bi ${isDanger ? 'bi-trash-fill' : 'bi-check-lg'}`} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
