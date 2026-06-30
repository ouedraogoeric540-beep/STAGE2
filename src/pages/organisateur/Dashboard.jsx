import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import CustomSelect from '../../components/common/CustomSelect'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts'

export default function OrgDashboard() {
  const { user } = useAuth()
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

  // Utilisation des couleurs vives pour le style AdminLTE
  const statCards = [
    { label: 'Mes événements', value: stats.total, icon: 'bi-calendar-event-fill', color: '#0D6EFD', textColor: '#fff' },
    { label: 'Événements actifs', value: stats.actifs, icon: 'bi-calendar-check-fill', color: '#198754', textColor: '#fff' },
    { label: 'Événements archivés', value: stats.archives, icon: 'bi-archive-fill', color: '#64748b', textColor: '#fff' },
    { label: 'Tickets vendus', value: stats.tickets, icon: 'bi-ticket-detailed-fill', color: '#ffc107', textColor: '#000' },
    { label: 'Revenus estimés', value: `${Number(stats.revenus).toLocaleString()} FCFA`, icon: 'bi-cash-coin', color: '#dc3545', textColor: '#fff' },
  ]

  // --- NOUVELLES DONNÉES: Top 5 Événements ---
  const top5Evenements = [...evenements]
    .map(ev => ({
      titre: ev.titre,
      revenu: ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
    }))
    .sort((a, b) => b.revenu - a.revenu)
    .slice(0, 5)

  // --- NOUVELLES DONNÉES: Répartition par Catégorie ---
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

  return (
    <Layout title="Dashboard">
      <div className="animate-fadeIn">

        {/* Salutation */}
        <div style={{ marginBottom: 28 }}>
          <h2 className="sp-page-title">Bonjour, {user?.name} 👋</h2>
        </div>

        {/* Stats avec ton design system */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <StatCard key={i} card={card} index={i} hasLink={true} />
          ))}
        </div>

        {/* ── GRILLE DES GRAPHIQUES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24, marginBottom: 32 }}>

          {/* Graphique Historique des Revenus */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-graph-up-arrow" style={{ marginRight: 8, color: '#10b981' }} />
              Historique des revenus (FCFA)
            </div>
            {historiqueRevenus.length > 0 ? (
              <div style={{ padding: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historiqueRevenus} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={10} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                    <Bar dataKey="revenu" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                Pas de données de revenus
              </div>
            )}
          </div>

          {/* Graphique Top 5 Événements */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-trophy" style={{ marginRight: 8, color: '#f59e0b' }} />
              Top 5 Événements (Revenus)
            </div>
            {top5Evenements.length > 0 && top5Evenements.some(e => e.revenu > 0) ? (
              <div style={{ padding: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top5Evenements} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                    <YAxis type="category" dataKey="titre" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                    <Bar dataKey="revenu" name="Revenu" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                Pas assez de données
              </div>
            )}
          </div>

          {/* Graphique Répartition Catégories (Donut) */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-pie-chart" style={{ marginRight: 8, color: '#0D6EFD' }} />
              Ventes par catégorie de billets
            </div>
            {repartitionCategories.length > 0 ? (
              <div style={{ padding: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repartitionCategories}
                      cx="50%" cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {repartitionCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} billets`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                Aucun billet vendu
              </div>
            )}
          </div>

          {/* Graphique Sexe */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-gender-ambiguous" style={{ marginRight: 8, color: '#e83e8c' }} />
              Participation par sexe
            </div>
            {statsSexe.length > 0 ? (
              <div style={{ padding: 20 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsSexe.slice(0, 5)} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="titre" tick={{ fontSize: 10 }} />
                    <YAxis type="number" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hommes" name="Hommes" fill="#0D6EFD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="femmes" name="Femmes" fill="#E83E8C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                Pas de données
              </div>
            )}
          </div>

        </div>

        {/* Derniers événements */}
        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <i className="bi bi-clock-history" style={{ marginRight: 8, color: 'var(--brand-color)' }} />
              Mes derniers événements
            </div>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="sp-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ minWidth: 800 }}>
                <thead>
                  <tr>
                    <th>Événement</th>
                    <th>Date</th>
                    <th>Lieu</th>
                    <th>Tickets</th>
                    <th>Revenus</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).slice(0, 10).map((ev) => {
                    const rev = ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
                    return (
                      <tr key={ev.id}>
                        <td style={{ fontWeight: 600 }}>{ev.titre}</td>
                        <td>{new Date(ev.date).toLocaleDateString('fr-FR')}</td>
                        <td>{ev.lieu}</td>
                        <td style={{ color: 'var(--brand-color)', fontWeight: 700 }}>{ev.tickets_count ?? 0}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>{Number(rev).toLocaleString()} FCFA</td>
                        <td>
                          <span className={`sp-badge sp-badge-${ev.statut}`}>
                            {ev.statut === 'termine' ? 'Terminé' : ev.statut}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {evenements.filter(ev => filtreTableau ? ev.statut === filtreTableau : true).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Aucun événement trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}