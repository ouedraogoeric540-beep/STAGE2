import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import ActionMenu from '../../components/common/ActionMenu'
import ConfirmModal from '../../components/common/ConfirmModal'
import CustomSelect from '../../components/common/CustomSelect'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'

import toast from 'react-hot-toast'

export default function OrgAgents() {
  const { isDark } = useTheme()
  const [agents, setAgents]         = useState([])
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [showAffect, setShowAffect] = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [detailsAgent, setDetailsAgent] = useState(null)
  const [saving, setSaving]         = useState(false)

  const [form, setForm]     = useState({ name: '', prenom: '', sexe: '', email: '', password: '', telephone: '' })
  const [affect, setAffect] = useState({ agent_id: '', evenement_ids: [] })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  
  const renderError = (field) => errors[field] ? <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[field][0]}</div> : null;
  const [rechercheAffect, setRechercheAffect] = useState('')

  const charger = (showLoading = true) => {
    if (showLoading) setLoading(true)
    Promise.all([api.get('/agents'), api.get('/mes-evenements')])
      .then(([a, e]) => { setAgents(a.data); setEvenements(e.data) })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setTimeout(() => charger(false), 0) }, [])

  const toggle = async (id) => {
    try {
      const res = await api.patch(`/agents/${id}/toggle`)
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, statut: res.data.statut } : a))
      toast.success(res.data.statut ? 'Compte activé' : 'Compte désactivé')
    } catch { toast.error('Erreur') }
  }

  const demanderSuppression = (id) => {
    setDeleteId(id)
  }

  const confirmerSuppression = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      await api.delete(`/agents/${deleteId}`)
      toast.success('Agent supprimé')
      setDeleteId(null)
      charger()
    } catch { toast.error('Erreur suppression') } finally { setSaving(false) }
  }

  const ouvrirCreer = () => {
    setEditingId(null)
    setErrors({})
    setForm({ name: '', prenom: '', sexe: '', email: '', password: '', telephone: '' })
    setShowModal(true)
  }

  const ouvrirEditer = (a) => {
    setEditingId(a.id)
    setErrors({})
    setForm({ name: a.name, prenom: a.prenom || '', sexe: a.sexe || '', email: a.email, password: '', telephone: a.telephone || '' })
    setShowModal(true)
  }

  const sauvegarderAgent = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (editingId) {
        await api.put(`/agents/${editingId}`, form)
        toast.success('Agent modifié avec succès')
      } else {
        await api.post('/agents', form)
        toast.success('Agent créé avec succès')
      }
      setShowModal(false)
      charger()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(apiErrors)
        toast.error('Veuillez corriger les erreurs signalées')
      }
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const affecterAgent = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/agents/affecter', affect)
      toast.success('Agent affecté avec succès')
      setShowAffect(false)
      setAffect({ agent_id: '', evenement_ids: [] })
      charger()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur affectation')
    } finally { setSaving(false) }
  }

  const desaffecterAgentEvent = async (agentId, evenementId) => {
    const currentAgent = agents.find(a => a.id === agentId)
    if (!currentAgent) return
    
    // Garder tous les autres événements sauf celui à supprimer
    const newEventIds = currentAgent.agent_evenements
      ? currentAgent.agent_evenements.filter(ev => ev.id !== evenementId).map(ev => ev.id)
      : []

    setSaving(true)
    try {
      await api.post('/agents/affecter', { agent_id: agentId, evenement_ids: newEventIds })
      toast.success('Agent désaffecté de cet événement')
      
      // Mettre à jour la modale directement
      setDetailsAgent(prev => ({
        ...prev,
        agent_evenements: prev.agent_evenements.filter(ev => ev.id !== evenementId),
        affectations_count: prev.affectations_count - 1
      }))

      charger()
    } catch {
      toast.error('Erreur lors de la désaffectation')
    } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    borderRadius: 8, color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', marginTop: 6,
  }

  const ouvrirAffecter = (a) => {
    // Pré-sélectionner les événements déjà affectés à cet agent
    const currentEventIds = a.agent_evenements ? a.agent_evenements.map(ev => ev.id) : []
    setAffect({ agent_id: a.id, evenement_ids: currentEventIds })
    setRechercheAffect('')
    setShowAffect(true)
  }

  const evenementsFiltres = evenements.filter((e) => e.statut === 'actif' && e.titre.toLowerCase().includes(rechercheAffect.toLowerCase()))

  const toutCocher = () => {
    const idsFiltres = evenementsFiltres.map(e => e.id)
    const newIds = [...new Set([...affect.evenement_ids, ...idsFiltres])]
    setAffect({ ...affect, evenement_ids: newIds })
  }

  const toutDecocher = () => {
    const idsFiltres = evenementsFiltres.map(e => e.id)
    const newIds = affect.evenement_ids.filter(id => !idsFiltres.includes(id))
    setAffect({ ...affect, evenement_ids: newIds })
  }

  return (
    <Layout title="Mes Agents">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Mes Agents</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{agents.length} agent(s)</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={ouvrirCreer} style={{
              padding: '10px 18px',
              background: 'var(--primary)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="bi bi-person-plus" /> Créer un agent
            </button>
          </div>
        </div>

        {/* Liste des agents (DashboardTable) */}
        <DashboardCard noPadding={true}>
          <DashboardTable 
            headers={['Agent', 'Contact', 'Statut', 'Affectations', 'Actions']}
            isEmpty={!loading && agents.length === 0}
            emptyText="Aucun agent créé pour le moment"
            emptyIcon="bi-person-badge"
          >
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="sp-spinner mx-auto" />
                </td>
              </tr>
            ) : agents.map((agent) => (
              <tr key={agent.id} 
                  style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {agent.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{agent.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {agent.email && <div><i className="bi bi-envelope"/> {agent.email}</div>}
                  {agent.telephone && <div><i className="bi bi-telephone"/> {agent.telephone}</div>}
                  {!agent.email && !agent.telephone && '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge-soft ${agent.statut ? 'badge-soft-success' : 'badge-soft-warning'}`} style={{ fontSize: 10 }}>
                    {agent.statut ? 'ACTIF' : 'INACTIF'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {agent.affectations_count > 0 ? (
                    <span style={{ color: '#0D6EFD', cursor: 'pointer', fontWeight: 600 }} onClick={() => setDetailsAgent(agent)}>
                      <i className="bi bi-link-45deg"/> {agent.affectations_count} affectation(s)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}><i className="bi bi-exclamation-circle" /> Non affecté</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <button onClick={() => ouvrirAffecter(agent)} className="btn-soft py-1 px-2" style={{ fontSize: 12, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', border: 'none', borderRadius: 6, fontWeight: 600 }}>
                      Affecter
                    </button>
                    <button onClick={() => ouvrirEditer(agent)} className="btn-soft py-1 px-2" style={{ fontSize: 12, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)' }}>
                      <i className="bi bi-pencil" />
                    </button>
                    <ActionMenu 
                      options={[
                        { label: agent.statut ? 'Désactiver' : 'Activer', icon: agent.statut ? 'bi-slash-circle-fill' : 'bi-check-circle-fill', color: agent.statut ? '#f59e0b' : '#10b981', onClick: () => toggle(agent.id) },
                        { divider: true },
                        { label: 'Supprimer', icon: 'bi-trash-fill', color: '#ef4444', onClick: () => demanderSuppression(agent.id) }
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </DashboardTable>
        </DashboardCard>
      </div>

      {/* Modal Créer agent */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="custom-scrollbar" style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Créer un agent</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={sauvegarderAgent}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Nom</label>
                  <input type="text" value={form.name} onChange={(e) => {
                    setForm({ ...form, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: null })
                  }} required style={{ ...inputStyle, padding: '10px 14px', width: '100%', ...(errors.name ? { borderColor: '#ef4444' } : {}) }} />
                  {renderError('name')}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => {
                    setForm({ ...form, prenom: e.target.value })
                    if (errors.prenom) setErrors({ ...errors, prenom: null })
                  }} style={{ ...inputStyle, padding: '10px 14px', width: '100%', ...(errors.prenom ? { borderColor: '#ef4444' } : {}) }} />
                  {renderError('prenom')}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => {
                  setForm({ ...form, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: null })
                }} required style={{ ...inputStyle, padding: '10px 14px', width: '100%', ...(errors.email ? { borderColor: '#ef4444' } : {}) }} />
                {renderError('email')}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Téléphone</label>
                  <input type="tel" value={form.telephone} onChange={(e) => {
                    setForm({ ...form, telephone: e.target.value })
                    if (errors.telephone) setErrors({ ...errors, telephone: null })
                  }} style={{ ...inputStyle, padding: '10px 14px', width: '100%', ...(errors.telephone ? { borderColor: '#ef4444' } : {}) }} />
                  {renderError('telephone')}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Sexe</label>
                  <CustomSelect 
                    value={form.sexe} 
                    onChange={(val) => {
                      setForm({ ...form, sexe: val })
                      if (errors.sexe) setErrors({ ...errors, sexe: null })
                    }}
                    placeholder="Sélectionner"
                    options={[
                      { value: 'M', label: 'Homme (M)' },
                      { value: 'F', label: 'Femme (F)' },
                    ]}
                    style={{ padding: '10px 14px', ...(errors.sexe ? { borderColor: '#ef4444' } : {}) }}
                  />
                  {renderError('sexe')}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: null })
                  }}
                    required={!editingId} style={{ ...inputStyle, padding: '10px 36px 10px 14px', width: '100%', ...(errors.password ? { borderColor: '#ef4444' } : {}) }} 
                    placeholder={editingId ? '(Laissez vide pour conserver)' : ''} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                  </button>
                </div>
                {renderError('password')}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', background: 'var(--primary)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? 'Sauvegarde…' : (editingId ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Affecter */}
      {showAffect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Affecter {agents.find(a => a.id === affect.agent_id)?.name}
              </h3>
              <button onClick={() => setShowAffect(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={affecterAgent}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Événements *</label>
                
                {evenements.filter((e) => e.statut === 'actif').length > 0 && (
                  <>
                    <input 
                      type="text" 
                      placeholder="Rechercher un événement..." 
                      value={rechercheAffect} 
                      onChange={(e) => setRechercheAffect(e.target.value)}
                      style={{ ...inputStyle, marginBottom: 10, marginTop: 0 }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <button type="button" onClick={toutCocher} style={{ flex: 1, padding: '6px', fontSize: 12, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Tout cocher</button>
                      <button type="button" onClick={toutDecocher} style={{ flex: 1, padding: '6px', fontSize: 12, background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Tout décocher</button>
                    </div>
                  </>
                )}

                <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 8, padding: 12, backgroundColor: isDark ? '#252839' : '#f7fafc' }}>
                  {evenements.filter((e) => e.statut === 'actif').length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Aucun événement actif.</div>
                  ) : evenementsFiltres.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Aucun événement ne correspond à votre recherche.</div>
                  ) : (
                    evenementsFiltres.map((e) => (
                      <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={affect.evenement_ids.includes(e.id)}
                          onChange={(ev) => {
                            if (ev.target.checked) setAffect({ ...affect, evenement_ids: [...affect.evenement_ids, e.id] })
                            else setAffect({ ...affect, evenement_ids: affect.evenement_ids.filter(id => id !== e.id) })
                          }}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-color)' }}
                        />
                        <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{e.titre}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowAffect(false)} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', background: '#198754', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? 'Affectation…' : 'Affecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible."
        onConfirm={confirmerSuppression}
        onCancel={() => setDeleteId(null)}
        loading={saving}
        isDanger={true}
      />

      {/* Modal Détails Affectations */}
      {detailsAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Affectations de {detailsAgent.name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{detailsAgent.affectations_count} événement(s)</p>
              </div>
              <button onClick={() => setDetailsAgent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {detailsAgent.agent_evenements && detailsAgent.agent_evenements.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detailsAgent.agent_evenements.map(ev => (
                    <li key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, background: isDark ? '#252839' : '#f8fafd', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ev.titre}</div>
                        {ev.date && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}><i className="bi bi-calendar me-1"></i> {new Date(ev.date).toLocaleDateString('fr-FR')}</div>}
                      </div>
                      <button 
                        onClick={() => desaffecterAgentEvent(detailsAgent.id, ev.id)}
                        disabled={saving}
                        title="Désaffecter l'agent de cet événement"
                        style={{ background: '#dc354515', color: '#dc3545', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                        onMouseEnter={(e) => { if(!saving) e.currentTarget.style.background = '#dc354525' }}
                        onMouseLeave={(e) => { if(!saving) e.currentTarget.style.background = '#dc354515' }}
                      >
                        <i className="bi bi-person-x-fill" /> <span className="d-none d-sm-inline">Retirer</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aucune affectation trouvée.</p>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button onClick={() => setDetailsAgent(null)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}