import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'

export default function OrgScans() {
  const { isDark } = useTheme()
  const [scans, setScans] = useState([])
  const [, setStats] = useState({ total_scannes: 0, capacite_totale: 0 })
  const [statsEvents, setStatsEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScan, setSelectedScan] = useState(null)

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'valide':
        return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-check-circle-fill me-1" /> Succès</span>
      case 'deja_utilise':
        return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-exclamation-triangle-fill me-1" /> Déjà scanné</span>
      default:
        return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}><i className="bi bi-x-circle-fill me-1" /> Échec</span>
    }
  }

  useEffect(() => {
    api.get('/scans/organisateur-logs')
      .then((res) => {
        setScans(res.data.scans.data || [])
        setStats(res.data.stats || { total_scannes: 0, capacite_totale: 0 })
        setStatsEvents(res.data.stats_par_evenement || [])
      })
      .catch(() => toast.error('Erreur chargement des logs de scan'))
      .finally(() => setLoading(false))
  }, [])



  return (
    <Layout title="Suivi des Scans">
      <div className="animate-fadeIn">
        <div style={{ marginBottom: 32 }}>
          <h2 className="sp-page-title">
            <i className="bi bi-qr-code-scan" style={{ marginRight: 12, color: 'var(--brand-color)' }} />
            Suivi des Scans (Temps Réel)
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Surveillez le taux de remplissage de vos événements et consultez l'historique des tickets scannés.
          </p>
        </div>

        {/* ── Taux de Remplissage par Événement ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="sp-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : statsEvents.length > 0 ? (
          <div className="event-grid" style={{ marginBottom: 32 }}>
            {statsEvents.map((evStat) => {
              const isIllimite = evStat.capacite_max == -1
              const pct = evStat.capacite_max > 0 ? Math.round((evStat.total_scannes / evStat.capacite_max) * 100) : 0
              return (
                <div key={evStat.id} className="card" style={{ padding: '16px 14px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, wordBreak: 'break-word', paddingRight: 8 }}>
                      {evStat.titre}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--brand-color)', flexShrink: 0 }}>
                      {isIllimite ? '∞' : `${pct}%`}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}><i className="bi bi-person-check" style={{ marginRight: 4 }}/>{evStat.total_scannes}</span>
                    <span>Cap: {isIllimite ? 'Illimitée' : evStat.capacite_max}</span>
                  </div>

                  {!isIllimite && (
                    <div style={{ width: '100%', height: 8, background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1)', 
                        borderRadius: 4,
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, marginBottom: 32 }}>
            Aucun événement actif pour le moment.
          </div>
        )}

        {/* ── Liste des logs de scan ── */}
        <div className="d-flex flex-column gap-2 mt-4">
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Historique des entrées</h3>
          {loading ? (
            <div className="text-center p-5"><div className="sp-spinner mx-auto" /></div>
          ) : scans.length > 0 ? (
            scans.map((scan) => (
              <div key={scan.id} className="soft-card-row" style={{ cursor: 'pointer' }} onClick={() => setSelectedScan(scan)}>
                <div className="d-flex flex-column gap-2 flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <h5 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{scan.ticket?.participant?.nom || 'Inconnu'}</h5>
                    {getStatusBadge(scan.resultat)}
                  </div>
                  <div className="text-muted d-flex gap-3 flex-wrap" style={{ fontSize: 13, fontWeight: 500 }}>
                    <span><i className="bi bi-clock"/> {new Date(scan.date_scan).toLocaleString('fr-FR')}</span>
                    <span><i className="bi bi-calendar-event"/> {scan.evenement?.titre || 'Inconnu'}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedScan(scan)} className="btn-soft btn-soft-primary">
                    Détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-5 text-muted">
              Aucun ticket scanné pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* Modale de Détails du Scan */}
      {selectedScan && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: 450, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            background: isDark ? '#1e293b' : '#fff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: 20, overflow: 'hidden',
            animation: 'slideUpFade 0.3s ease',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedScan(null)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 22, zIndex: 10 }}
            >
              <i className="bi bi-x-circle-fill" />
            </button>

            <div style={{ padding: '20px 20px 16px', textAlign: 'center', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, flexShrink: 0 }}>
              <div style={{ marginBottom: 12 }}>
                {getStatusBadge(selectedScan.resultat)}
              </div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Détails du Scan</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                {new Date(selectedScan.date_scan).toLocaleString()}
              </div>
            </div>
            
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Événement</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.evenement?.titre || 'Inconnu'}</div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Agent (Scanner)</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.agent?.name || 'Inconnu'}</div>
                  {selectedScan.agent?.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedScan.agent.email}</div>}
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Participant</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.ticket?.participant?.nom || 'Non renseigné'}</div>
                  {selectedScan.ticket?.participant?.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedScan.ticket.participant.email}</div>}
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Catégorie du Ticket</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedScan.ticket?.categorie?.nom || 'Standard'}</div>
                </div>

                <div style={{ background: isDark ? '#0f172a' : '#f8fafd', padding: '10px 16px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Code QR unique</div>
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
