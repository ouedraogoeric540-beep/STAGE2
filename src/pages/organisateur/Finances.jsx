import { useEffect, useState, useCallback } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
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
const pct = (n) => Number(n || 0).toFixed(1) + '%'

export default function OrgFinances() {
  const { isDark } = useTheme()

  const [finances, setFinances]           = useState(null)
  const [retraits, setRetraits]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedEv, setSelectedEv]       = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [form, setForm]                   = useState({
    evenement_id: '',
    montant: '',
    numero_mobile_money: '',
    operateur: '',
    commentaire: '',
  })

  const charger = useCallback(async () => {
    setLoading(true)
    try {
      const [finRes, retRes] = await Promise.all([
        api.get('/organisateur/finances'),
        api.get('/organisateur/retraits'),
      ])
      setFinances(finRes.data)
      setRetraits(retRes.data.data || retRes.data)
    } catch (err) {
      toast.error('Erreur lors du chargement des données financières')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { charger() }, [charger])

  const totaux = finances?.totaux || {}
  const parEvenement = finances?.finances_par_evenement || []

  // Données pour le graphique camembert
  const pieData = parEvenement
    .filter(e => e.revenu_net > 0)
    .map(e => ({ name: e.evenement_titre, value: e.revenu_net }))

  const COLORS = ['#0D6EFD', '#E83E8C', '#10b981', '#f59e0b', '#6366f1', '#fd7e14']

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const demanderRetrait = async (e) => {
    e.preventDefault()
    if (!form.evenement_id) return toast.error('Sélectionnez un événement')
    if (!form.montant || Number(form.montant) <= 0) return toast.error('Montant invalide')
    if (!form.operateur) return toast.error('Sélectionnez un opérateur')
    if (!form.numero_mobile_money) return toast.error('Numéro Mobile Money requis')

    const ev = parEvenement.find(e => String(e.evenement_id) === String(form.evenement_id))
    if (ev && Number(form.montant) > ev.solde_disponible) {
      return toast.error(`Montant supérieur au solde disponible (${fmt(ev.solde_disponible)})`)
    }

    setSubmitting(true)
    try {
      await api.post('/organisateur/retraits', {
        ...form,
        montant: Number(form.montant),
      })
      toast.success('Demande de retrait envoyée ! Vous recevrez une confirmation par email.')
      setShowModal(false)
      setForm({ evenement_id: '', montant: '', numero_mobile_money: '', operateur: '', commentaire: '' })
      charger()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la demande de retrait')
    } finally {
      setSubmitting(false)
    }
  }

  const card = (bg, text = '#fff') => ({
    background: bg, color: text, borderRadius: 14, padding: '20px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s',
  })

  const cardHover = (e) => { e.currentTarget.style.transform = 'translateY(-3px)' }
  const cardLeave = (e) => { e.currentTarget.style.transform = 'translateY(0)' }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  }
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }

  if (loading) return (
    <Layout title="Mes Finances">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Chargement de vos finances…</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Mes Finances">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* ── Header + Bouton Retrait ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tableau de bord financier</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Taux de commission SecurePass : <strong style={{ color: '#ef4444' }}>{finances?.taux_commission ?? 7}%</strong> · Votre part : <strong style={{ color: '#10b981' }}>{100 - (finances?.taux_commission ?? 7)}%</strong>
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
              fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <i className="bi bi-wallet2" /> Demander un retrait
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Revenu brut', value: fmt(totaux.revenu_brut), icon: 'bi-cash-stack', bg: '#0D6EFD', desc: 'Total tickets vendus' },
            { label: 'Commission (7%)', value: fmt(totaux.commission), icon: 'bi-percent', bg: '#6366f1', desc: 'Prélevée par SecurePass' },
            { label: 'Revenu net', value: fmt(totaux.revenu_net), icon: 'bi-graph-up-arrow', bg: '#10b981', desc: 'Votre part (93%)' },
            { label: 'Déjà retiré', value: fmt(totaux.total_retire), icon: 'bi-arrow-down-circle-fill', bg: '#f59e0b', desc: 'Retraits validés' },
            { label: 'Solde disponible', value: fmt(totaux.solde_disponible), icon: 'bi-wallet-fill', bg: totaux.solde_disponible > 0 ? '#0D6EFD' : '#64748b', desc: 'Prêt à retirer' },
            { label: 'Tickets vendus', value: totaux.tickets_vendus ?? 0, icon: 'bi-ticket-perforated-fill', bg: '#E83E8C', desc: 'Total général' },
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
        {pieData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Répartition par événement */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Répartition du revenu net par événement</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend formatter={(v) => v.length > 20 ? v.slice(0, 20) + '…' : v} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Barchart par événement */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Revenus par événement</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={parEvenement} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="evenement_titre" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="revenu_brut" fill="#0D6EFD" name="Brut" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenu_net"  fill="#10b981" name="Net"  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Tableau des finances par événement ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Suivi financier par événement</h3>
          </div>
          {parEvenement.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="bi bi-cash-coin" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.4 }} />
              <p>Aucune vente pour le moment</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    {['Événement', 'Tickets vendus', 'Revenu brut', 'Commission (7%)', 'Revenu net', 'Retiré', 'Solde dispo', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parEvenement.map((ev, i) => (
                    <tr key={ev.evenement_id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{ev.evenement_titre}</div>
                        {ev.retraits_en_attente > 0 && (
                          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>
                            <i className="bi bi-clock me-1" /> {ev.retraits_en_attente} retrait(s) en attente
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.tickets_vendus}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0D6EFD' }}>{fmt(ev.revenu_brut)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ef4444' }}>{fmt(ev.commission)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{fmt(ev.revenu_net)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{fmt(ev.total_retire)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontWeight: 700, fontSize: 14,
                          color: ev.solde_disponible > 0 ? '#10b981' : 'var(--text-muted)'
                        }}>{fmt(ev.solde_disponible)}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {ev.solde_disponible > 0 ? (
                          <button
                            onClick={() => { setForm(f => ({ ...f, evenement_id: String(ev.evenement_id) })); setShowModal(true) }}
                            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                          >
                            Retirer
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Historique des retraits ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Historique des retraits</h3>
          </div>
          {retraits.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="bi bi-wallet2" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.4 }} />
              <p>Aucune demande de retrait</p>
            </div>
          ) : (
            <div className="d-flex flex-column">
              {retraits.map(r => {
                const cfg = STATUT_CONFIG[r.statut] || STATUT_CONFIG.en_attente
                return (
                  <div key={r.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bi ${cfg.icon}`} style={{ color: cfg.color, fontSize: 18 }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{r.evenement?.titre ?? '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {r.reference} · {OPERATEURS.find(o => o.value === r.operateur)?.label || r.operateur} · {r.numero_mobile_money}
                        </div>
                        {r.motif_refus && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}><i className="bi bi-info-circle me-1" />{r.motif_refus}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{fmt(r.montant)}</span>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Demande de retrait ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, animation: 'slideUp 0.3s ease', maxHeight: '95vh', overflowY: 'auto', margin: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Demander un retrait</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Vers votre compte Mobile Money</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22 }}><i className="bi bi-x-lg" /></button>
            </div>

            <form onSubmit={demanderRetrait}>
              {/* Sélection événement */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Événement <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="evenement_id" value={form.evenement_id} onChange={e => {
                  const ev = parEvenement.find(ev => String(ev.evenement_id) === e.target.value)
                  setSelectedEv(ev || null)
                  setForm(f => ({ ...f, evenement_id: e.target.value, montant: '' }))
                }} style={inputStyle} required>
                  <option value="">— Sélectionner un événement —</option>
                  {parEvenement.filter(ev => ev.solde_disponible > 0).map(ev => (
                    <option key={ev.evenement_id} value={String(ev.evenement_id)}>
                      {ev.evenement_titre} (dispo : {fmt(ev.solde_disponible)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Solde disponible info */}
              {selectedEv && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Revenu net</span><br /><strong style={{ color: '#10b981' }}>{fmt(selectedEv.revenu_net)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Déjà retiré</span><br /><strong style={{ color: 'var(--text-secondary)' }}>{fmt(selectedEv.total_retire)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Solde disponible</span><br /><strong style={{ color: '#10b981', fontSize: 16 }}>{fmt(selectedEv.solde_disponible)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Tickets vendus</span><br /><strong>{selectedEv.tickets_vendus}</strong></div>
                  </div>
                </div>
              )}

              {/* Montant */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Montant à retirer (FCFA) <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="number" name="montant" value={form.montant} onChange={handleForm}
                  min="1" max={selectedEv?.solde_disponible || 99999999} required style={inputStyle}
                  placeholder={selectedEv ? `Max : ${Math.floor(selectedEv.solde_disponible)} FCFA` : 'Montant'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                {/* Opérateur */}
                <div>
                  <label style={labelStyle}>Opérateur Mobile Money <span style={{ color: '#ef4444' }}>*</span></label>
                  <select name="operateur" value={form.operateur} onChange={handleForm} style={inputStyle} required>
                    <option value="">— Sélectionner —</option>
                    {OPERATEURS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Numéro */}
                <div>
                  <label style={labelStyle}>Numéro Mobile Money <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="numero_mobile_money" value={form.numero_mobile_money} onChange={handleForm}
                    placeholder="Ex: +22670000000" required style={inputStyle} />
                </div>
              </div>

              {/* Commentaire */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Commentaire (facultatif)</label>
                <textarea name="commentaire" value={form.commentaire} onChange={handleForm}
                  placeholder="Informations complémentaires…" rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, minHeight: 60 }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: submitting ? '#6c757d' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Envoi…</> : <><i className="bi bi-wallet2" /> Soumettre la demande</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
