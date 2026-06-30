import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import AlerteModal from '../../components/common/AlerteModal'

export default function EvenementsAssignes() {
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [alerteModalOpen, setAlerteModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)

  useEffect(() => {
    api.get('/agent/evenements')
      .then((res) => setEvenements(res.data))
      .catch(() => toast.error('Erreur lors du chargement des événements'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Mes Événements Affectés">
      <div className="animate-fadeIn">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="sp-page-title mb-0">Mes Événements ({evenements.length})</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="sp-spinner" style={{ margin: '0 auto' }} /></div>
        ) : evenements.length === 0 ? (
          <div className="card text-center" style={{ padding: 40, borderStyle: 'dashed' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 40, color: 'var(--text-muted)', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-muted)' }}>Vous n'avez aucun événement assigné pour le moment.</p>
          </div>
        ) : (
          <div className="agent-events-grid">
            {evenements.map((ev) => (
              <div key={ev.id} className="card agent-event-card" style={{ 
                border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                overflow: 'hidden'
              }}>
                <div className="agent-card-header" style={{ 
                  height: 100, 
                  background: 'var(--gradient-brand)',
                  padding: 20,
                  display: 'flex',
                  alignItems: 'flex-end',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 }}>
                    <i className="bi bi-calendar3 me-1" /> {new Date(ev.date).toLocaleDateString()}
                  </div>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {ev.titre}
                  </h3>
                </div>

                <div className="card-body agent-card-body" style={{ padding: 20 }}>
                  <div className="agent-card-location" style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                    <i className="bi bi-geo-alt me-2" /> {ev.lieu}
                  </div>

                  {/* Jauge de remplissage */}
                  <div style={{ marginBottom: 20 }}>
                    <div className="agent-card-progress-text" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      <span>Remplissage</span>
                      <span style={{ color: ((ev.scans_valides_count || 0) / (ev.capacite_max_calculee || 1)) > 0.9 ? '#ef4444' : 'var(--brand-color)' }}>
                        {ev.scans_valides_count || 0} / {ev.capacite_max_calculee || '?'}
                      </span>
                    </div>
                    <div style={{ height: 8, background: isDark ? '#1e2130' : '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.min(((ev.scans_valides_count || 0) / (ev.capacite_max_calculee || 1)) * 100, 100)}%`,
                        background: ((ev.scans_valides_count || 0) / (ev.capacite_max_calculee || 1)) > 0.9 ? '#ef4444' : 'var(--brand-color)',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                  </div>

                  <h6 className="agent-card-stats-title" style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                    Statistiques
                  </h6>
                  
                  <div className="agent-card-stats">
                    <div className="agent-stat-box" style={{ background: isDark ? '#252839' : '#f8fafd', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                      <div className="agent-stat-val" style={{ color: 'var(--brand-color)' }}>{ev.scans_count || 0}</div>
                      <div className="agent-stat-lbl" style={{ color: 'var(--text-secondary)' }}>TOTAL</div>
                    </div>
                    <div className="agent-stat-box" style={{ background: 'rgba(25,135,84,0.1)', border: '1px solid rgba(25,135,84,0.2)' }}>
                      <div className="agent-stat-val" style={{ color: '#198754' }}>{ev.scans_valides_count || 0}</div>
                      <div className="agent-stat-lbl" style={{ color: '#198754' }}>VALIDES</div>
                    </div>
                    <div className="agent-stat-box" style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.2)' }}>
                      <div className="agent-stat-val" style={{ color: '#dc3545' }}>{ev.scans_invalides_count || 0}</div>
                      <div className="agent-stat-lbl" style={{ color: '#dc3545' }}>REFUSÉS</div>
                    </div>
                  </div>

                  <div className="agent-card-actions" style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/agent/scanner', { state: { evenementId: ev.id } })} className="btn btn-brand" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}>
                      <i className="bi bi-qr-code-scan me-2" /> Scanner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlerteModal 
        isOpen={alerteModalOpen} 
        onClose={() => setAlerteModalOpen(false)} 
        evenementId={selectedEventId} 
      />
    </Layout>
  )
}
