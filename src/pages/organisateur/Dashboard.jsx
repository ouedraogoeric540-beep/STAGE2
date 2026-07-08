import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import CustomSelect from '../../components/common/CustomSelect'
import DashboardStatCard from '../../components/common/dashboard/DashboardStatCard'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'
import StatusBadge from '../../components/common/dashboard/StatusBadge'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts'

export default function OrgDashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [evenements, setEvenements] = useState([])
  const [statsSexe, setStatsSexe] = useState([])
  const [historiqueRevenus, setHistoriqueRevenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreTableau, setFiltreTableau] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/mes-evenements'),
      api.get('/mes-evenements/stats-sexe'),
      api.get('/mes-evenements/historique-revenus')
    ])
      .then(([evRes, statsRes, revRes]) => {
        setEvenements(evRes.data)
        setStatsSexe(statsRes.data)
        setHistoriqueRevenus(revRes.data)
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: evenements.length,
    actifs: evenements.filter((e) => e.statut === 'actif').length,
    archives: evenements.filter((e) => e.statut === 'termine').length,
    tickets: evenements.reduce((s, e) => s + (e.tickets_count || 0), 0),
    revenus: evenements.reduce((s, e) => {
      return s + (e.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0)
    }, 0),
  }

  const statCards = [
    { label: 'Mes événements', value: stats.total, icon: 'bi-calendar-event-fill', color: '#0D6EFD', textColor: '#fff' },
    { label: 'Événements actifs', value: stats.actifs, icon: 'bi-calendar-check-fill', color: '#198754', textColor: '#fff' },
    { label: 'Événements archivés', value: stats.archives, icon: 'bi-archive-fill', color: '#64748b', textColor: '#fff' },
    { label: 'Tickets vendus', value: stats.tickets, icon: 'bi-ticket-detailed-fill', color: '#ffc107', textColor: '#000' },
    { label: 'Revenus estimés', value: `${Number(stats.revenus).toLocaleString()} FCFA`, icon: 'bi-cash-coin', color: '#dc3545', textColor: '#fff' },
  ]

  const top5Evenements = [...evenements]
    .map(ev => ({
      titre: ev.titre,
      revenu: ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
    }))
    .sort((a, b) => b.revenu - a.revenu)
    .slice(0, 5)

  const categoryStatsMap = {}
  evenements.forEach(ev => {
    ev.categories?.forEach(c => {
      if (!categoryStatsMap[c.nom]) categoryStatsMap[c.nom] = 0
      categoryStatsMap[c.nom] += (c.quantite_vendue || 0)
    })
  })
  const repartitionCategories = Object.keys(categoryStatsMap)
    .map(nom => ({ name: nom, value: categoryStatsMap[nom] }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const PIE_COLORS = ['#0D6EFD', '#E83E8C', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b']
  
  const borderCol = isDark ? '#2a2d3e' : '#e2e8f0'
  const textMuted = isDark ? '#9aa0b4' : '#6c757d'
  
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e2130' : '#ffffff',
    border: `1px solid ${borderCol}`,
    borderRadius: 10,
    color: isDark ? '#e8eaf0' : '#1a202c',
  }

  if (loading) return (
    <Layout title="Dashboard">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des statistiques…</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Dashboard">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Bonjour, {user?.name} 👋
          </h2>
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24, marginBottom: 32 }}>

          <DashboardCard title="Historique des revenus (FCFA)" icon="bi-graph-up-arrow" iconColor="#10b981">
            {historiqueRevenus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historiqueRevenus} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderCol} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: textMuted }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                  <Bar dataKey="revenu" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Pas de données de revenus</div>
            )}
          </DashboardCard>

          <DashboardCard title="Top 5 Événements (Revenus)" icon="bi-trophy" iconColor="#f59e0b">
            {top5Evenements.length > 0 && top5Evenements.some(e => e.revenu > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top5Evenements} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={borderCol} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: textMuted }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="titre" width={100} tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                  <Bar dataKey="revenu" name="Revenu" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Pas assez de données</div>
            )}
          </DashboardCard>

          <DashboardCard title="Ventes par catégorie de billets" icon="bi-pie-chart" iconColor="#0D6EFD">
            {repartitionCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={repartitionCategories} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {repartitionCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value} billets`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Aucun billet vendu</div>
            )}
          </DashboardCard>

          <DashboardCard title="Participation par sexe" icon="bi-gender-ambiguous" iconColor="#e83e8c">
            {statsSexe.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsSexe.slice(0, 5)} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderCol} />
                  <XAxis dataKey="titre" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <YAxis type="number" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend formatter={(value) => <span style={{ color: isDark ? '#e8eaf0' : '#1a202c', fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="hommes" name="Hommes" fill="#0D6EFD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="femmes" name="Femmes" fill="#E83E8C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Pas de données</div>
            )}
          </DashboardCard>

        </div>

        <DashboardCard 
          title="Mes derniers événements" 
          icon="bi-clock-history" 
          iconColor="var(--brand-color)"
          noPadding={true}
          headerRight={
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
          }
        >
          <DashboardTable 
            headers={['Événement', 'Date', 'Lieu', 'Tickets vendus', 'Revenus', 'Statut']}
            isEmpty={evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).length === 0}
            emptyText="Aucun événement trouvé."
            emptyIcon="bi-calendar-x"
          >
            {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).slice(0, 10).map((ev) => {
              const rev = ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
              return (
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
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0D6EFD' }}>
                    {ev.tickets_count ?? 0}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>
                    {Number(rev).toLocaleString()} FCFA
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge statut={ev.statut} />
                  </td>
                </tr>
              )
            })}
          </DashboardTable>
        </DashboardCard>

      </div>
    </Layout>
  )
}