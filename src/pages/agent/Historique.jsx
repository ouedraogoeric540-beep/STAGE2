import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'
import CustomSelect from '../../components/common/CustomSelect'

export default function AgentHistorique() {
  const { isDark } = useTheme()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedScan, setSelectedScan] = useState(null)

  const fetchHistorique = (currentPage = 1, searchQuery = search, statutQuery = statutFilter) => {
    setLoading(true)
    api.get('/scans/historique', { params: { page: currentPage, search: searchQuery, statut: statutQuery } })
      .then((res) => {
        setScans(res.data.data || [])
        setTotalPages(res.data.last_page || 1)
        setPage(currentPage)
      })
      .catch(() => toast.error('Erreur lors du chargement de l\'historique'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistorique(1, search, statutFilter)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, statutFilter])

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'valide':
        return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-check-circle-fill me-1" /> VALIDE</span>
      case 'deja_utilise':
        return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-exclamation-triangle-fill me-1" /> DÉJÀ SCANNÉ</span>
      default:
        return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-x-circle-fill me-1" /> INVALIDE</span>
    }
  }

  return (
    <Layout title="Historique Complet">
      <div className="animate-fadeIn">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <h2 className="sp-page-title mb-0">Historique de vos Scans</h2>
          
          {/* Filtres */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Rechercher un participant ou un code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  borderRadius: 12, padding: '12px 16px 12px 46px',
                  color: 'var(--text-primary)', outline: 'none'
                }}
              />
            </div>
            
            <div style={{ flex: '1 1 200px', maxWidth: 250 }}>
              <CustomSelect
                value={statutFilter}
                onChange={setStatutFilter}
                placeholder="Tous les statuts"
                options={[
                  { value: 'valide', label: 'Valide', icon: 'bi-check-circle-fill', color: '#10b981' },
                  { value: 'deja_utilise', label: 'Déjà Scanné', icon: 'bi-exclamation-triangle-fill', color: '#f59e0b' },
                  { value: 'invalide', label: 'Invalide / Mauvais Événement', icon: 'bi-x-circle-fill', color: '#ef4444' }
                ]}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="sp-spinner" style={{ margin: '0 auto' }} /></div>
        ) : scans.length === 0 ? (
          <div className="card text-center" style={{ padding: 40, borderStyle: 'dashed' }}>
            <i className="bi bi-inbox" style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucun scan trouvé pour cette recherche.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: isDark ? '#1e293b' : '#f8fafd', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Date & Heure</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Événement</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Participant</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Statut</th>
                    <th style={{ padding: '16px 24px', width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => (
                    <tr 
                      key={scan.id} 
                      onClick={() => setSelectedScan(scan)}
                      style={{ 
                        borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`, 
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: 14 }}>
                        <div style={{ fontWeight: 600 }}>{new Date(scan.date_scan).toLocaleDateString()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(scan.date_scan).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: 14 }}>
                        {scan.evenement?.titre || 'Inconnu'}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontSize: 14 }}>
                        <div style={{ fontWeight: 700 }}>{scan.ticket?.participant?.nom || 'Ticket Anonyme'}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {getStatusBadge(scan.resultat)}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="bi bi-chevron-right" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 20, borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}>
                <button 
                  onClick={() => fetchHistorique(page - 1)} 
                  disabled={page === 1}
                  className="btn" 
                  style={{ background: isDark ? '#1e293b' : '#f8fafd', color: 'var(--text-primary)' }}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Page {page} / {totalPages}
                </span>
                <button 
                  onClick={() => fetchHistorique(page + 1)} 
                  disabled={page === totalPages}
                  className="btn" 
                  style={{ background: isDark ? '#1e293b' : '#f8fafd', color: 'var(--text-primary)' }}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modale de Détails du Scan */}
      {selectedScan && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 450,
            background: isDark ? '#1e293b' : '#fff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: 20, overflow: 'hidden',
            animation: 'slideUpFade 0.3s ease',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedScan(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, zIndex: 10 }}
            >
              <i className="bi bi-x-circle-fill" />
            </button>

            <div style={{ padding: 30, textAlign: 'center', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ marginBottom: 16 }}>
                {getStatusBadge(selectedScan.resultat)}
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Détails du Scan</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                {new Date(selectedScan.date_scan).toLocaleString()}
              </div>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Événement</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.evenement?.titre || 'Inconnu'}</div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Participant</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.ticket?.participant?.nom || 'Non renseigné'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{selectedScan.ticket?.participant?.email || ''}</div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Catégorie du Ticket</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.ticket?.categorie?.nom || 'Standard'}</div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Code QR unique</div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedScan.qr_code}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
