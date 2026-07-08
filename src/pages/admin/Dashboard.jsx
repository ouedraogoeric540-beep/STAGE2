import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import CustomSelect from '../../components/common/CustomSelect'
import DashboardStatCard from '../../components/common/dashboard/DashboardStatCard'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'
import StatusBadge from '../../components/common/dashboard/StatusBadge'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import RevenueChart from '../../components/charts/RevenueChart'
import TicketScansChart from '../../components/charts/TicketScansChart'

const COLORS = ['#0D6EFD', '#E83E8C', '#198754', '#FFC107', '#6f42c1', '#fd7e14']

export default function AdminDashboard() {
  const { isDark } = useTheme()
  const { user }   = useAuth()

  const [stats, setStats]     = useState({})
  const [graphStats, setGraphStats] = useState({ revenus_7j: [], scans_7j: [] })
  const [users, setUsers]     = useState([])
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreTableau, setFiltreTableau] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/statistiques'),
      api.get('/admin/statistiques-graphiques'),
      api.get('/admin/users'),
      api.get('/admin/evenements'),
    ])
      .then(([s, g, u, e]) => {
        setStats(s.data)
        setGraphStats(g.data)
        setUsers(u.data)
        setEvenements(e.data.data || e.data)
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  // Données graphique rôles
  const rolesData = [
    { name: 'Admins',        value: users.filter((u) => u.role === 'admin').length,        color: '#E83E8C' },
    { name: 'Organisateurs', value: users.filter((u) => u.role === 'organisateur').length, color: '#0D6EFD' },
    { name: 'Agents',        value: users.filter((u) => u.role === 'agent').length,        color: '#198754' },
    { name: 'Participants',  value: users.filter((u) => u.role === 'participant').length,   color: '#FFC107' },
  ].filter((d) => d.value > 0)

  // Données graphique tickets
  const ticketsData = [
    { name: 'Valides',  value: stats.tickets_valides  || 0, color: '#198754' },
    { name: 'Utilisés', value: stats.tickets_utilises || 0, color: '#0D6EFD' },
    { name: 'Expirés',  value: stats.tickets_expires  || 0, color: '#DC3545' },
  ]

  // Données graphique événements par mois
  const evenementsParMois = () => {
    const mois = {}
    evenements.forEach((ev) => {
      const m = new Date(ev.created_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      mois[m] = (mois[m] || 0) + 1
    })
    return Object.entries(mois).slice(-6).map(([name, total]) => ({ name, total }))
  }

  // Données revenus par événement (top 5)
  const revenusData = evenements
    .map((ev) => ({
      name: ev.titre.length > 12 ? ev.titre.slice(0, 12) + '…' : ev.titre,
      tickets: ev.tickets_count || 0,
    }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5)

  const statCards = [
    { label: 'Total utilisateurs', value: stats.utilisateurs       || 0, icon: 'bi-people',              color: '#0D6EFD', textColor: '#fff' },
    { label: 'Organisateurs',      value: stats.organisateurs      || 0, icon: 'bi-person-workspace',    color: '#6f42c1', textColor: '#fff' },
    { label: 'Agents',             value: stats.agents             || 0, icon: 'bi-person-badge',        color: '#E83E8C', textColor: '#fff' },
    { label: 'Événements actifs',  value: stats.evenements_actifs  || 0, icon: 'bi-calendar-check',      color: '#198754', textColor: '#fff' },
    { label: 'Événements archivés',value: evenements.filter(ev => ev.statut === 'termine').length, icon: 'bi-archive', color: '#64748b', textColor: '#fff' },
    { label: 'Tickets vendus',     value: (stats.tickets_valides || 0) + (stats.tickets_utilises || 0), icon: 'bi-ticket-perforated', color: '#ffc107', textColor: '#000' },
    { label: 'Revenus total',      value: `${Number(stats.revenus_total || 0).toLocaleString()} FCFA`, icon: 'bi-cash-coin', color: '#dc3545', textColor: '#fff' },
  ]

  const borderCol = isDark ? '#2a2d3e' : '#e2e8f0'
  const textMuted = isDark ? '#9aa0b4' : '#6c757d'
  const gridCol   = isDark ? '#2a2d3e' : '#f0f0f0'

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e2130' : '#ffffff',
    border: `1px solid ${borderCol}`,
    borderRadius: 10,
    color: isDark ? '#e8eaf0' : '#1a202c',
  }

  if (loading) return (
    <Layout title="Dashboard Admin">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des statistiques…</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Dashboard Admin">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* ── Salutation ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Bonjour, {user?.name} 👋
          </h2>
        </div>

        {/* ── Stat Cards ── */}
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

        {/* ── Graphiques avancés ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 24, marginBottom: 32 }}>
          <DashboardCard title="Revenus des 7 derniers jours" icon="bi-cash-coin" iconColor="#10b981">
            <RevenueChart data={graphStats.revenus_7j} />
          </DashboardCard>

          <DashboardCard title="Tickets Scannés (7 derniers jours)" icon="bi-qr-code-scan" iconColor="#3b82f6">
            <TicketScansChart data={graphStats.scans_7j} />
          </DashboardCard>
        </div>

        {/* ── Graphiques ligne 1 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24, marginBottom: 32 }}>

          {/* Évolution événements */}
          <DashboardCard title="Événements créés (6 derniers mois)" icon="bi-graph-up" iconColor="#0D6EFD">
            {evenementsParMois().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={evenementsParMois()}>
                  <defs>
                    <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0D6EFD" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D6EFD" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridCol} />
                  <XAxis dataKey="name" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="total" stroke="#0D6EFD" strokeWidth={2} fill="url(#colorEv)" name="Événements" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-bar-chart" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de données
              </div>
            )}
          </DashboardCard>

          {/* Top événements par tickets */}
          <DashboardCard title="Top 5 événements (tickets vendus)" icon="bi-trophy" iconColor="#FFC107">
            {revenusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridCol} horizontal={false} />
                  <XAxis type="number" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="tickets" name="Tickets" radius={[0, 6, 6, 0]}>
                    {revenusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-bar-chart" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de données
              </div>
            )}
          </DashboardCard>
        </div>

        {/* ── Graphiques ligne 2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24, marginBottom: 32 }}>

          {/* Répartition rôles */}
          <DashboardCard title="Répartition des utilisateurs" icon="bi-people" iconColor="#E83E8C">
            {rolesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={rolesData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rolesData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
                  <Legend formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-pie-chart" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de données
              </div>
            )}
          </DashboardCard>

          {/* Statut tickets */}
          <DashboardCard title="Statut des tickets" icon="bi-ticket-perforated" iconColor="#198754">
            {ticketsData.some((t) => t.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={ticketsData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ticketsData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-ticket" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de tickets
              </div>
            )}
          </DashboardCard>
        </div>

        {/* ── Derniers événements ── */}
        <DashboardCard 
          title="Derniers événements" 
          icon="bi-calendar-event" 
          iconColor="#0D6EFD"
          noPadding={true}
          headerRight={
            <CustomSelect 
              value={filtreTableau} 
              onChange={setFiltreTableau}
              placeholder="Tous"
              options={[
                { value: 'actif', label: 'Actifs', color: '#10b981' },
                { value: 'termine', label: 'Terminés', color: '#64748b' },
                { value: 'annule', label: 'Annulés', color: '#ef4444' }
              ]}
              style={{ padding: '6px 12px', minWidth: 140 }}
            />
          }
        >
          <DashboardTable 
            headers={['Événement', 'Date', 'Lieu', 'Organisateur', 'Tickets', 'Statut']}
            isEmpty={evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).length === 0}
            emptyText="Aucun événement trouvé"
            emptyIcon="bi-calendar-x"
          >
            {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).slice(0, 10).map((ev) => (
              <tr key={ev.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                  {ev.titre}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {ev.lieu}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {ev.organisateur?.name || '—'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0D6EFD' }}>
                  {ev.tickets_count ?? 0}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusBadge statut={ev.statut} />
                </td>
              </tr>
            ))}
          </DashboardTable>
        </DashboardCard>

      </div>
    </Layout>
  )
}