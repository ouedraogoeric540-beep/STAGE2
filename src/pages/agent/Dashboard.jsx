import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AgentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [evenements, setEvenements] = useState([])
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/agent/evenements'),
      api.get('/scans/historique'),
    ])
      .then(([ev, sc]) => {
        setEvenements(ev.data)
        setScans(sc.data.data || [])
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    evenements: evenements.length,
    scansTotal: Math.max(scans.length, evenements.reduce((acc, ev) => acc + (ev.scans_count || 0), 0)),
    scansValides: scans.filter((s) => s.resultat === 'valide').length,
    scansInvalides: scans.filter((s) => s.resultat !== 'valide').length,
  }

  const statCards = [
    { label: 'Événements assignés', value: stats.evenements, icon: 'bi-calendar-event', color: '#6f42c1', textColor: '#fff' },
    { label: 'Total Tickets Scannés', value: stats.scansTotal, icon: 'bi-qr-code-scan', color: '#0D6EFD', textColor: '#fff' },
    { label: 'Tickets Valides', value: stats.scansValides, icon: 'bi-check-circle', color: '#198754', textColor: '#fff' },
    { label: 'Déjà Utilisés/Invalides', value: stats.scansInvalides, icon: 'bi-x-circle', color: '#dc3545', textColor: '#fff' },
  ]

  return (
    <Layout title="Dashboard Agent">
      <div className="animate-fadeIn">
        
        {/* Salutation */}
        <div style={{ marginBottom: 28 }}>
          <h2 className="sp-page-title">Bonjour, {user?.name} 👋</h2>
        </div>

        {/* Bouton Scanner (Utilise tes classes de boutons) */}
        <div className="card" style={{ 
          background: 'var(--gradient-brand)', 
          padding: '24px', 
          marginBottom: 28, 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center', 
          justifyContent: 'space-between',
          border: 'none'
        }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Scanner un ticket</div>
            <div style={{ opacity: 0.9 }}>Accédez au scanner QR Code pour valider les entrées</div>
          </div>
          <button onClick={() => navigate('/agent/scanner')} className="btn" style={{ background: '#fff', color: 'var(--brand-color)' }}>
            <i className="bi bi-qr-code-scan" style={{ marginRight: 8 }} />
            Ouvrir le scanner
          </button>
        </div>

        {/* Stats */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="sp-spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 20, marginBottom: 32 }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  backgroundColor: card.color,
                  borderRadius: 8,
                  position: 'relative',
                  overflow: 'hidden',
                  color: card.textColor,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: 1.2 }}>{card.value}</div>
                    <div style={{ fontSize: '15px', marginTop: 5 }}>{card.label}</div>
                  </div>
                  
                  <i className={`bi ${card.icon}`} style={{
                    position: 'absolute',
                    top: 10,
                    right: 15,
                    fontSize: '70px',
                    color: card.textColor === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.15)', 
                    zIndex: 0,
                    transition: 'transform 0.3s ease',
                  }} />
                  
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    padding: '6px 0',
                    textAlign: 'center',
                    fontSize: '13px',
                    zIndex: 1,
                    cursor: 'pointer',
                    color: card.textColor
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)' }}
                  >
                    Plus d'infos <i className="bi bi-arrow-right-circle" style={{ marginLeft: 4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Historique des scans */}
            <div className="card">
              <div className="card-header">Mes derniers scans</div>
              <div className="table-responsive">
                <table className="table" style={{ minWidth: 800 }}>
                  <thead>
                    <tr><th>Événement</th><th>Participant</th><th>Résultat</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {scans.slice(0, 8).map((scan) => (
                      <tr key={scan.id}>
                        <td>{scan.evenement?.titre || '—'}</td>
                        <td>{scan.ticket?.participant?.nom || '—'}</td>
                        <td>
                          <span className={`sp-badge sp-badge-${scan.resultat === 'valide' ? 'valide' : 'expire'}`}>
                            {scan.resultat}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(scan.date_scan).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}