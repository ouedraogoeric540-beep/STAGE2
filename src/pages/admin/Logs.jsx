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

        <div className="table-responsive" style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, backgroundColor: isDark ? '#1a1d2d' : '#f8fafc' }}>
                    {['Utilisateur', 'Action', 'Détails', 'Réseau (IP)', 'Date & Heure'].map((h) => (
                      <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const actionDetails = getActionDetails(log.action)
                    const dateObj = new Date(log.created_at)
                    return (
                      <tr 
                        key={log.id} 
                        style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#f0f0f0'}`, transition: 'all 0.2s ease', cursor: 'default' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#252839' : '#f8f9ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Utilisateur */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ 
                              width: 38, height: 38, borderRadius: 12, 
                              background: log.user ? 'var(--brand-glow)' : (isDark ? '#2a2d3e' : '#e2e8f0'),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: log.user ? 'var(--brand-color)' : 'var(--text-muted)',
                              fontSize: 16
                            }}>
                              <i className={log.user ? "bi bi-person-fill" : "bi bi-robot"} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                                {log.user?.name || 'Système Autonome'}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {log.user?.email || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: `${actionDetails.color}15`, border: `1px solid ${actionDetails.color}30` }}>
                            <i className={actionDetails.icon} style={{ color: actionDetails.color, fontSize: 12 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: actionDetails.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {log.action}
                            </span>
                          </div>
                        </td>

                        {/* Détails */}
                        <td style={{ padding: '16px 20px', maxWidth: 300 }}>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {log.details || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun détail</span>}
                          </div>
                        </td>

                        {/* IP */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', background: isDark ? '#141827' : '#f1f5f9', padding: '4px 10px', borderRadius: 8, width: 'fit-content' }}>
                            <i className="bi bi-hdd-network" />
                            {log.ip_address || '—'}
                          </div>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                            {dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            <i className="bi bi-clock me-1" />
                            {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <i className="bi bi-journal-x" style={{ fontSize: 28, color: 'var(--text-secondary)' }} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Aucun log disponible</h4>
                  <p style={{ fontSize: 13 }}>L'historique des actions est vide pour le moment.</p>
                </div>
              )}
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
      </div>
    </Layout>
  )
}