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
          <div className="d-flex flex-column gap-2 mt-4">
            {evenements.map((ev) => (
              <div key={ev.id} className="soft-card-row">
                <div className="d-flex flex-column gap-2 flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <h5 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{ev.titre}</h5>
                    <span className="badge-soft badge-soft-primary" style={{ fontSize: 10 }}>
                      <i className="bi bi-calendar-event me-1" />
                      {new Date(ev.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-2" style={{ fontSize: 12, fontWeight: 600 }}>
                    <span className="badge-soft badge-soft-secondary"><i className="bi bi-geo-alt me-1" /> {ev.lieu}</span>
                    <span className="badge-soft" style={{ background: 'rgba(13,110,253,0.1)', color: '#0d6efd', border: '1px solid rgba(13,110,253,0.2)' }}><i className="bi bi-people me-1" /> {ev.scans_count || 0} Scans</span>
                    <span className="badge-soft badge-soft-success"><i className="bi bi-check-circle me-1" /> {ev.scans_valides_count || 0} Valides</span>
                    <span className="badge-soft badge-soft-danger"><i className="bi bi-x-circle me-1" /> {ev.scans_invalides_count || 0} Invalides</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                  <button onClick={() => navigate('/agent/scanner', { state: { evenementId: ev.id } })} className="btn btn-brand" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, borderRadius: 12 }}>
                    <i className="bi bi-qr-code-scan me-2" /> Scanner
                  </button>
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
