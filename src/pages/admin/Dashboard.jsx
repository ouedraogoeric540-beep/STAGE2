import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import CustomSelect from '../../components/common/CustomSelect'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#0D6EFD', '#E83E8C', '#198754', '#FFC107', '#6f42c1', '#fd7e14']

export default function AdminDashboard() {
  const { isDark } = useTheme()
  const { user }   = useAuth()

  const [stats, setStats]     = useState({})
  const [users, setUsers]     = useState([])
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreTableau, setFiltreTableau] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/statistiques'),
      api.get('/admin/users'),
      api.get('/admin/evenements'),
    ])
      .then(([s, u, e]) => {
        setStats(s.data)
        setUsers(u.data)
        setEvenements(e.data)
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

  // Données graphique sexe
  const sexeData = [
    { name: 'Hommes', value: stats.participants_hommes || 0, color: '#0D6EFD' },
    { name: 'Femmes', value: stats.participants_femmes || 0, color: '#E83E8C' },
  ].filter((d) => d.value > 0)

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

  const cardBg    = isDark ? '#1e2130' : '#ffffff'
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
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Chargement des statistiques…</p>
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
        <div className="admin-stats-grid">
          {statCards.map((card, i) => (
            <StatCard key={i} card={card} index={i} hasLink={true} />
          ))}
        </div>

        {/* ── Graphiques ligne 1 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20, marginBottom: 20 }}>

          {/* Évolution événements */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: '16px 12px', minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-graph-up" style={{ color: '#0D6EFD' }} />
              Événements créés (6 derniers mois)
            </h3>
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
          </div>

          {/* Top événements par tickets */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: '16px 12px', minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-trophy" style={{ color: '#FFC107' }} />
              Top 5 événements (tickets vendus)
            </h3>
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
          </div>
        </div>

        {/* ── Graphiques ligne 2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20, marginBottom: 20 }}>

          {/* Répartition rôles */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: '16px 12px', minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-people" style={{ color: '#E83E8C' }} />
              Répartition des utilisateurs
            </h3>
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
                  <Legend
                    formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-pie-chart" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de données
              </div>
            )}
          </div>

          {/* Statut tickets */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, padding: '16px 12px', minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-ticket-perforated" style={{ color: '#198754' }} />
              Statut des tickets
            </h3>
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
                  <Legend
                    formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-ticket" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
                Pas encore de tickets
              </div>
            )}
          </div>
        </div>

        {/* ── Derniers événements ── */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-calendar-event" style={{ color: '#0D6EFD' }} />
              Derniers événements
            </h3>
            <CustomSelect 
              value={filtreTableau} 
              onChange={setFiltreTableau}
              placeholder="Tous les événements"
              options={[
                { value: 'actif', label: 'Actifs', color: '#10b981' },
                { value: 'termine', label: 'Terminés', color: '#64748b' },
                { value: 'annule', label: 'Annulés', color: '#ef4444' }
              ]}
              style={{ padding: '6px 12px', minWidth: 160 }}
            />
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                  {['Événement', 'Organisateur', 'Date', 'Tickets', 'Statut'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).slice(0, 10).map((ev) => {
                  const statutColor = { actif: '#198754', termine: '#6c757d', annule: '#DC3545' }
                  return (
                    <tr key={ev.id} style={{ borderBottom: `1px solid ${borderCol}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ev.titre}</div>
                        <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                          <i className="bi bi-geo-alt" style={{ marginRight: 4 }} />{ev.lieu}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {ev.organisateur?.name || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#0D6EFD', fontSize: 15 }}>{ev.tickets_count ?? 0}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statutColor[ev.statut]}20`, color: statutColor[ev.statut] }}>
                          {ev.statut === 'termine' ? 'Terminé' : ev.statut}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
                <i className="bi bi-calendar-x" style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
                Aucun événement trouvé
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}