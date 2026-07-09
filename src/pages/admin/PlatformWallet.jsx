import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from '../../api/axios'
import Button from '../../components/ui/Button'
import PageLoader from '../../components/common/PageLoader'
import Layout from '../../components/common/Layout'
import PlatformWithdrawModal from '../../components/admin/PlatformWithdrawModal'
import toast from 'react-hot-toast'

export default function PlatformWallet() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const fetchWalletData = async () => {
    try {
      const res = await axios.get('/admin/platform/finances')
      setData(res.data)
    } catch (err) {
      toast.error("Impossible de charger les données du portefeuille.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const handleWithdraw = async (withdrawData) => {
    await axios.post('/admin/platform/finances/withdraw', withdrawData)
    toast.success("Retrait effectué avec succès !")
    fetchWalletData() // Refresh data
  }

  if (loading) return <Layout title="Portefeuille SecurePass"><PageLoader /></Layout>
  if (!data) return <Layout title="Portefeuille SecurePass"><div style={{ padding: 24 }}>Erreur de chargement.</div></Layout>

  const { finances, evolution, historique } = data

  const card = (bg, text = '#fff') => ({
    background: bg, color: text, borderRadius: 14, padding: '20px 24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
  })

  const cardHover = (e) => { e.currentTarget.style.transform = 'translateY(-3px)' }
  const cardLeave = (e) => { e.currentTarget.style.transform = 'translateY(0)' }

  const formatDate = (dateString) => {
    if (!dateString) return 'Aucun';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Aucun';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <Layout title="Portefeuille SecurePass">
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Portefeuille SecurePass
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Gestion centralisée des commissions de la plateforme (7%)
          </p>
        </div>
        <Button 
          variant="primary" 
          icon="bi-box-arrow-up"
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          Effectuer un retrait
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Commission Totale Générée', value: finances.commission_totale, icon: 'bi-graph-up-arrow', bg: '#0D6EFD', desc: 'Total généré (7%)' },
          { label: 'Solde Disponible', value: finances.commission_disponible, icon: 'bi-wallet2', bg: '#10b981', desc: 'Prêt à être retiré' },
          { label: 'Commissions Retirées', value: finances.commission_retiree, icon: 'bi-box-arrow-up', bg: '#ef4444', desc: 'Retraits déjà effectués' },
          { label: 'Commissions (Ce mois)', value: finances.ce_mois, icon: 'bi-calendar-month', bg: '#f59e0b', desc: 'Sur le mois en cours' },
        ].map((kpi, i) => (
          <div key={i} style={card(kpi.bg)} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                  {Number(kpi.value).toLocaleString()} <span style={{ fontSize: 14, opacity: 0.8 }}>FCFA</span>
                </div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>{kpi.desc}</div>
              </div>
              <i className={`bi ${kpi.icon}`} style={{ fontSize: 32, opacity: 0.25 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Evolution Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Évolution des Commissions (Mensuelle)</h3>
          <div style={{ height: 300, width: '100%' }}>
            {evolution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolution}>
                  <defs>
                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    formatter={(val) => [Number(val).toLocaleString() + ' FCFA', 'Commissions']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCommission)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Pas assez de données pour le graphique.
              </div>
            )}
          </div>
        </div>

        {/* Info Rapides */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Aperçu Rapide</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Aujourd'hui</span>
            <span style={{ fontWeight: 600 }}>{Number(finances.aujourdhui).toLocaleString()} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cette Semaine</span>
            <span style={{ fontWeight: 600 }}>{Number(finances.cette_semaine).toLocaleString()} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cette Année</span>
            <span style={{ fontWeight: 600 }}>{Number(finances.cette_annee).toLocaleString()} FCFA</span>
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nombre de retraits</span>
            <span style={{ fontWeight: 600 }}>{finances.nb_retraits}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Dernier retrait</span>
            <span style={{ fontWeight: 600 }}>
              {formatDate(finances.dernier_retrait)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, margin: '0 0 20px' }}>Historique des Retraits (SecurePass)</h3>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16, border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          <table className="sp-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Admin</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Destination</th>
                <th>Solde Avant</th>
                <th>Solde Après</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {historique.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                    Aucun retrait effectué pour le moment.
                  </td>
                </tr>
              ) : (
                historique.map(retrait => (
                  <tr key={retrait.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{retrait.reference}</td>
                    <td>{formatDateTime(retrait.created_at)}</td>
                    <td>{retrait.admin?.name || 'Inconnu'}</td>
                    <td style={{ fontWeight: 700 }}>{Number(retrait.montant).toLocaleString()} FCFA</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 12,
                        background: 'var(--bg-body)', color: 'var(--text-secondary)'
                      }}>
                        {retrait.mode === 'mobile_money' ? 'Mobile Money' : 'Banque'}
                      </span>
                    </td>
                    <td>
                      <div>{retrait.operateur_ou_banque}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{retrait.destination}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{Number(retrait.solde_avant).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{Number(retrait.solde_apres).toLocaleString()}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: retrait.statut_api === 'succes' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: retrait.statut_api === 'succes' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {retrait.statut_api === 'succes' ? 'SUCCÈS' : 'ÉCHEC'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

        <PlatformWithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          soldeDisponible={finances.commission_disponible}
          onSubmit={handleWithdraw}
        />
      </div>
    </Layout>
  )
}
