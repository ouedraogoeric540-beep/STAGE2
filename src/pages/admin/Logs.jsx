import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const getActionDetails = (action) => {
  if (action?.includes('Connexion'))   return { color: '#10b981', icon: 'bi-box-arrow-in-right' }
  if (action?.includes('Création'))    return { color: '#3b82f6', icon: 'bi-plus-circle-fill' }
  if (action?.includes('Suppression')) return { color: '#ef4444', icon: 'bi-trash-fill' }
  if (action?.includes('Modification'))return { color: '#f59e0b', icon: 'bi-pencil-fill' }
  if (action?.includes('Scan'))        return { color: '#8b5cf6', icon: 'bi-qr-code-scan' }
  if (action?.includes('Sauvegarde'))  return { color: '#06b6d4', icon: 'bi-cloud-download-fill' }
  return { color: '#64748b', icon: 'bi-activity' }
}

export default function AdminLogs() {
  const { isDark } = useTheme()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [meta, setMeta]       = useState({})

  const charger = (p = 1, showLoading = true) => {
    if (showLoading) setLoading(true)
    api.get(`/admin/logs?page=${p}`)
      .then((r) => { setLogs(r.data.data); setMeta(r.data) })
      .catch(() => toast.error('Erreur chargement logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setTimeout(() => charger(1, false), 0) }, [])

  return (
    <Layout title="Logs Système">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Logs Système</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Historique de toutes les actions sur la plateforme</p>
        </div>

        {/* Liste Logs Soft UI */}
        {loading ? (
          <div className="text-center p-5"><div className="sp-spinner mx-auto" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="bi bi-journal-x" style={{ fontSize: 28, color: 'var(--text-secondary)' }} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Aucun log disponible</h4>
            <p style={{ fontSize: 13 }}>L'historique des actions est vide pour le moment.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 mt-4">
            {logs.map((log) => {
              const actionDetails = getActionDetails(log.action)
              const dateObj = new Date(log.created_at)
              return (
                <div key={log.id} className="soft-card-row" style={{ cursor: 'default' }}>
                  <div className="d-flex flex-column gap-2 flex-grow-1">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: `${actionDetails.color}15`, border: `1px solid ${actionDetails.color}30` }}>
                        <i className={actionDetails.icon} style={{ color: actionDetails.color, fontSize: 11 }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: actionDetails.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {log.action}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <i className={log.user ? "bi bi-person-fill" : "bi bi-robot"} style={{ color: log.user ? 'var(--brand-color)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{log.user?.name || 'Système Autonome'}</span>
                      </div>
                    </div>
                    
                    <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word', paddingLeft: 8 }}>
                      {log.details || <span style={{ fontStyle: 'italic' }}>Aucun détail</span>}
                    </div>

                    <div className="d-flex gap-3 flex-wrap" style={{ fontSize: 12, fontWeight: 500, paddingLeft: 8 }}>
                      <span style={{ color: 'var(--text-secondary)' }}><i className="bi bi-clock me-1"/> {dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}><i className="bi bi-hdd-network"/> {log.ip_address || '—'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

          {/* Pagination Intelligente */}
          {meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '24px 20px', borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, flexWrap: 'wrap' }}>
              <button 
                onClick={() => { if (page > 1) { setPage(page - 1); charger(page - 1) } }}
                disabled={page === 1}
                style={{
                  height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  background: isDark ? '#1a1d2d' : '#fff', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => !page === 1 && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                onMouseLeave={(e) => !page === 1 && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
              >
                <i className="bi bi-chevron-left" style={{ fontSize: 11 }} /> Précédent
              </button>

              {(() => {
                const totalPages = meta.last_page;
                let pages = [];
                if (totalPages <= 7) {
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  if (page <= 4) {
                    pages = [1, 2, 3, 4, 5, '...', totalPages];
                  } else if (page >= totalPages - 3) {
                    pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                  }
                }

                return pages.map((p, index) => (
                  p === '...' ? (
                    <span key={`dots-${index}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 2 }}>...</span>
                  ) : (
                    <button 
                      key={p} 
                      onClick={() => { setPage(p); charger(p) }} 
                      style={{
                        width: 38, height: 38, borderRadius: 10, border: p === page ? 'none' : `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                        cursor: 'pointer', fontWeight: p === page ? 700 : 600, fontSize: 13,
                        background: p === page ? 'var(--brand-color, #0D6EFD)' : (isDark ? '#1a1d2d' : '#fff'),
                        color: p === page ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease',
                        boxShadow: p === page ? '0 4px 12px rgba(13, 110, 253, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => p !== page && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                      onMouseLeave={(e) => p !== page && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
                    >
                      {p}
                    </button>
                  )
                ))
              })()}

              <button 
                onClick={() => { if (page < meta.last_page) { setPage(page + 1); charger(page + 1) } }}
                disabled={page === meta.last_page}
                style={{
                  height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  background: isDark ? '#1a1d2d' : '#fff', color: page === meta.last_page ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: page === meta.last_page ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => !page === meta.last_page && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                onMouseLeave={(e) => !page === meta.last_page && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
              >
                Suivant <i className="bi bi-chevron-right" style={{ fontSize: 11 }} />
              </button>
            </div>
          )}
      </div>
    </Layout>
  )
}