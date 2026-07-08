import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import DashboardStatCard from '../../components/common/dashboard/DashboardStatCard'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'
import StatusBadge from '../../components/common/dashboard/StatusBadge'

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

  if (loading) return (
    <Layout title="Dashboard Agent">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des données…</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Dashboard Agent">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        
        {/* Salutation */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Bonjour, {user?.name} 👋</h2>
        </div>

        {/* Bouton Scanner */}
        <div className="card" style={{ 
          background: 'var(--gradient-brand)', 
          padding: '24px', 
          marginBottom: 28, 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center', 
          justifyContent: 'space-between',
          border: 'none',
          borderRadius: 16
        }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Scanner un ticket</div>
            <div style={{ opacity: 0.9, marginTop: 4, fontSize: 14 }}>Accédez au scanner QR Code pour valider les entrées</div>
          </div>
          <button onClick={() => navigate('/agent/scanner')} className="btn" style={{ background: '#fff', color: 'var(--brand-color)', fontWeight: 700, padding: '10px 20px', borderRadius: 10 }}>
            <i className="bi bi-qr-code-scan" style={{ marginRight: 8 }} />
            Ouvrir le scanner
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <DashboardStatCard 
              key={i} 
              label={card.label} 
              value={card.value} 
              icon={card.icon} 
              bg={card.color} 
              textColor={card.textColor}
            />
          ))}
        </div>

        {/* Historique des scans */}
        <DashboardCard title="Mes derniers scans" icon="bi-clock-history" noPadding={true}>
          <DashboardTable 
            headers={['Participant', 'Événement', 'Date du scan', 'Statut']}
            isEmpty={scans.length === 0}
            emptyText="Aucun scan récent."
            emptyIcon="bi-qr-code"
          >
            {scans.slice(0, 8).map((scan) => (
              <tr key={scan.id} 
                  style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                  {scan.ticket?.participant?.nom || 'Ticket Anonyme'}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  <i className="bi bi-calendar-event me-1" /> {scan.evenement?.titre || 'Inconnu'}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {new Date(scan.date_scan).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusBadge statut={scan.resultat} />
                </td>
              </tr>
            ))}
          </DashboardTable>
        </DashboardCard>

      </div>
    </Layout>
  )
}