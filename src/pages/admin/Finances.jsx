import { useEffect, useState, useCallback } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const OPERATEURS = [
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money',   label: 'Moov Money' },
  { value: 'mtn_money',    label: 'MTN Money' },
  { value: 'wave',         label: 'Wave' },
  { value: 'autre',        label: 'Autre' },
]

const STATUT_CONFIG = {
  en_attente: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'En attente', icon: 'bi-clock' },
  valide:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Validé',     icon: 'bi-check-circle-fill' },
  refuse:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Refusé',     icon: 'bi-x-circle-fill' },
}

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR') + ' FCFA'

export default function AdminFinances() {
  const { isDark } = useTheme()

  const [stats, setStats]               = useState(null)
  const [retraits, setRetraits]         = useState([])
  const [revenusChart, setRevenusChart] = useState([])
  const [loading, setLoading]           = useState(true)

  // Validation modal state
  const [showModal, setShowModal]       = useState(false)
  const [selectedRetrait, setSelectedRetrait] = useState(null)
  const [actionRetrait, setActionRetrait]     = useState('') // 'valider' | 'refuser'
  const [motifRefus, setMotifRefus]           = useState('')
  const [submitting, setSubmitting]           = useState(false)

  const charger = useCallback(async () => {
    setLoading(true)
    try {
      const [finRes, revRes, retRes] = await Promise.all([
        api.get('/admin/finances'),
        api.get('/admin/finances/revenus?periode=jour&nb=30'),
        api.get('/admin/retraits?statut=en_attente'),
      ])
      setStats(finRes.data)
      setRevenusChart(revRes.data)
      setRetraits(retRes.data.data || retRes.data)
    } catch (err) {
      toast.error('Erreur lors du chargement des données financières')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const traiterRetrait = async (e) => {
    e.preventDefault()
    if (actionRetrait === 'refuser' && !motifRefus) {
      return toast.error('Veuillez indiquer un motif de refus.')
    }

    setSubmitting(true)
    try {
      if (actionRetrait === 'valider') {
        await api.patch(`/admin/retraits/${selectedRetrait.id}/valider`)
        toast.success('Retrait validé avec succès')
      } else {
        await api.patch(`/admin/retraits/${selectedRetrait.id}/refuser`, { motif_refus: motifRefus })
        toast.success('Retrait refusé')
      }
      setShowModal(false)
      setSelectedRetrait(null)
      charger()
    } catch (err) {
      toast.error(err.response?.data?.message || `Erreur lors du traitement du retrait`)
    } finally {
      setSubmitting(false)
    }
  }

  const card = (bg, text = '#fff') => ({
    background: bg, color: text, borderRadius: 14, padding: '20px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
  })

  const cardHover = (e) => { e.currentTarget.style.transform = 'translateY(-3px)' }
  const cardLeave = (e) => { e.currentTarget.style.transform = 'translateY(0)' }

  if (loading) return (
    <Layout title="Supervision Financière">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Chargement des données financières…</p>
        </div>
      </div>
    </Layout>
  )

  const glob = stats?.stats || {}
  const methodes = stats?.repartition_methodes || []
  const pieMethodes = methodes.map(m => ({ name: m.methode, value: Number(m.total) }))
  const COLORS = ['#0D6EFD', '#f59e0b', '#10b981', '#E83E8C', '#6366f1']

  return (
    <Layout title="Supervision Financière">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Supervision Financière Globale</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Contrôle des flux financiers, commissions et retraits organisateurs.
            </p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Chiffre d\'affaires (CA)', value: fmt(glob.ca_total), icon: 'bi-cash-stack', bg: '#0D6EFD', desc: 'Total brut encaissé' },
            { label: 'Commissions gagnées', value: fmt(glob.commission_totale), icon: 'bi-piggy-bank-fill', bg: '#10b981', desc: `${glob.taux_commission}% retenus` },
            { label: 'Montant reversé', value: fmt(glob.reverse_total), icon: 'bi-arrow-down-circle-fill', bg: '#f59e0b', desc: 'Aux organisateurs' },
            { label: 'Solde restant (Marchand)', value: fmt(glob.solde_marchand), icon: 'bi-safe2-fill', bg: '#6366f1', desc: 'À reverser + commissions' },
            { label: 'Revenu du mois', value: fmt(glob.revenu_mois), icon: 'bi-calendar-check-fill', bg: '#E83E8C', desc: 'CA sur le mois en cours' },
          ].map((kpi, i) => (
            <div key={i} style={card(kpi.bg)} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{kpi.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>{kpi.desc}</div>
                </div>
                <i className={`bi ${kpi.icon}`} style={{ fontSize: 32, opacity: 0.25 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Graphiques ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Chart : Évolution des revenus */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Évolution du CA (30 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenusChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D6EFD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D6EFD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Area type="monotone" dataKey="total" stroke="#0D6EFD" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart : Méthodes de paiement */}
          {pieMethodes.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Méthodes de paiement (Volume)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieMethodes} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieMethodes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Retraits en attente de validation ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Demandes de retrait en attente</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Vérifiez et validez les virements vers les organisateurs</p>
            </div>
            <div style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {glob.retraits?.en_attente || 0} demande(s)
            </div>
          </div>

          {retraits.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="bi bi-check-circle" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.4, color: '#10b981' }} />
              <p>Aucune demande de retrait en attente. Tout est à jour !</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    {['Référence', 'Organisateur', 'Événement', 'Montant', 'Mobile Money', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retraits.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.reference}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{r.organisateur?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.organisateur?.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{r.evenement?.titre}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--text-primary)', fontSize: 15 }}>{fmt(r.montant)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0D6EFD', background: 'rgba(13,110,253,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                          {OPERATEURS.find(o => o.value === r.operateur)?.label || r.operateur}
                        </span>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{r.numero_mobile_money}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => { setSelectedRetrait(r); setActionRetrait('valider'); setMotifRefus(''); setShowModal(true) }}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, marginRight: 8 }}
                        >
                          Traiter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Validation / Refus ── */}
      {showModal && selectedRetrait && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, animation: 'slideUp 0.3s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Traitement du retrait</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22 }}><i className="bi bi-x-lg" /></button>
            </div>

            {/* Récap */}
            <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Montant :</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(selectedRetrait.montant)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Organisateur :</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>{selectedRetrait.organisateur?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Événement :</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: 13 }}>{selectedRetrait.evenement?.titre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Envoi vers :</span>
                <span style={{ fontWeight: 700, color: '#0D6EFD', fontSize: 13 }}>
                  {OPERATEURS.find(o => o.value === selectedRetrait.operateur)?.label} - {selectedRetrait.numero_mobile_money}
                </span>
              </div>
            </div>

            <form onSubmit={traiterRetrait}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button type="button" onClick={() => setActionRetrait('valider')}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: actionRetrait === 'valider' ? '2px solid #10b981' : '1px solid var(--border)', background: actionRetrait === 'valider' ? 'rgba(16,185,129,0.1)' : 'var(--bg-surface)', color: actionRetrait === 'valider' ? '#10b981' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                  <i className="bi bi-check-circle me-2" />Valider
                </button>
                <button type="button" onClick={() => setActionRetrait('refuser')}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: actionRetrait === 'refuser' ? '2px solid #ef4444' : '1px solid var(--border)', background: actionRetrait === 'refuser' ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface)', color: actionRetrait === 'refuser' ? '#ef4444' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                  <i className="bi bi-x-circle me-2" />Refuser
                </button>
              </div>

              {actionRetrait === 'refuser' && (
                <div style={{ marginBottom: 24, animation: 'fadeIn 0.2s' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Motif du refus <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea value={motifRefus} onChange={e => setMotifRefus(e.target.value)} required rows={3}
                    placeholder="Ex: Informations Mobile Money incorrectes"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical' }} />
                </div>
              )}

              {actionRetrait === 'valider' && (
                <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 13, color: '#92400e', marginBottom: 24 }}>
                  <strong>Attention :</strong> Assurez-vous d'avoir effectué le transfert de {fmt(selectedRetrait.montant)} vers le compte Mobile Money de l'organisateur avant de valider.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: actionRetrait === 'valider' ? '#10b981' : '#ef4444', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Traitement…</> : 'Confirmer'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </Layout>
  )
}
