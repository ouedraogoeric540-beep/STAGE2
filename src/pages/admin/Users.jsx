import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import ActionMenu from '../../components/common/ActionMenu'
import CustomSelect from '../../components/common/CustomSelect'
import toast from 'react-hot-toast'

const ROLES = ['', 'admin', 'organisateur', 'agent']

export default function AdminUsers() {
  const { isDark } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || ''
  
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre]   = useState(initialRole)
  const [showModal, setShowModal] = useState(false)
  const [showAffect, setShowAffect] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  const [detailsUser, setDetailsUser] = useState(null)
  const [evenements, setEvenements] = useState([])
  const [affect, setAffect] = useState({ agent_id: '', evenement_ids: [] })
  const [form, setForm] = useState({ name: '', prenom: '', sexe: '', email: '', password: '', role: 'organisateur', telephone: '' })
  const [saving, setSaving]   = useState(false)

  const charger = (role = filtre, showLoading = true) => {
    if (showLoading) setLoading(true)
    Promise.all([
      api.get('/admin/users', { params: role ? { role } : {} }),
      api.get('/admin/evenements')
    ])
      .then(([u, e]) => {
        setUsers(u.data)
        setEvenements(e.data)
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const currentRole = searchParams.get('role') || ''
    setFiltre(currentRole)
    charger(currentRole, false)
  }, [searchParams])

  const toggle = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, statut: res.data.statut } : u))
      toast.success(res.data.statut ? 'Compte activé' : 'Compte désactivé')
    } catch { toast.error('Erreur') }
  }

  const affecterAgent = async (e) => {
    e.preventDefault()
    if (!affect.evenement_ids || affect.evenement_ids.length === 0) {
      return toast.error('Veuillez sélectionner au moins un événement.')
    }
    setSaving(true)
    try {
      await api.post('/admin/users/affecter', affect)
      toast.success('Agent affecté avec succès')
      setShowAffect(false)
      setAffect({ agent_id: '', evenement_ids: [] })
      charger(filtre, false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur affectation')
    } finally { setSaving(false) }
  }

  const ouvrirAffecter = (a) => {
    setAffect({ agent_id: a.id, evenement_ids: [] })
    setShowAffect(true)
  }

  const ouvrirCreer = () => {
    setEditingId(null)
    setForm({ name: '', prenom: '', sexe: '', email: '', password: '', role: 'organisateur', telephone: '' })
    setShowModal(true)
  }

  const ouvrirEditer = (u) => {
    setEditingId(u.id)
    setForm({ name: u.name, prenom: u.prenom || '', sexe: u.sexe || '', email: u.email, password: '', role: u.role, telephone: u.telephone || '' })
    setShowModal(true)
  }

  const demanderSuppression = (id) => {
    setDeleteId(id)
  }

  const confirmerSuppression = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      await api.delete(`/admin/users/${deleteId}`)
      toast.success('Utilisateur supprimé')
      setDeleteId(null)
      charger()
    } catch { toast.error('Erreur suppression') } finally { setSaving(false) }
  }

  const sauvegarder = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, form)
        toast.success('Compte modifié avec succès')
      } else {
        await api.post('/admin/users', form)
        toast.success('Compte créé avec succès')
      }
      setShowModal(false)
      charger()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]))
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const roleColor = { admin: '#E83E8C', organisateur: '#0D6EFD', agent: '#198754' }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    borderRadius: 8, color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', marginTop: 6,
  }

  return (
    <Layout title="Utilisateurs">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Utilisateurs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{users.length} compte(s) trouvé(s)</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Filtre rôle */}
            <CustomSelect 
              value={filtre} 
              onChange={(val) => { 
                setFiltre(val); 
                setSearchParams(val ? { role: val } : {});
              }}
              placeholder="Tous les rôles"
              options={[
                { value: 'admin', label: 'Admin', icon: 'bi-shield-fill-check', color: '#ef4444' },
                { value: 'organisateur', label: 'Organisateur', icon: 'bi-briefcase-fill', color: '#8b5cf6' },
                { value: 'agent', label: 'Agent', icon: 'bi-person-badge-fill', color: '#10b981' },
                { value: 'participant', label: 'Participant', icon: 'bi-person-fill', color: '#3b82f6' }
              ]}
              style={{ minWidth: 180 }}
            />
            <button onClick={ouvrirCreer} style={{
              padding: '8px 20px',
              background: 'var(--primary)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="bi bi-person-plus" /> Créer un compte
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="table-responsive" style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                    {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#f0f0f0'}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: roleColor[u.role] || '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.telephone || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${roleColor[u.role]}20`, color: roleColor[u.role] }}>
                            {u.role}
                          </span>
                          {u.role === 'agent' && (
                            u.agent_evenements && u.agent_evenements.length > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#0D6EFD20', color: '#0D6EFD' }}>
                                  <i className="bi bi-link-45deg"></i> {u.agent_evenements.length}
                                </span>
                                <button onClick={() => setDetailsUser(u)} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <i className="bi bi-eye-fill" style={{ fontSize: 11 }} /> Détails
                                </button>
                              </div>
                            ) : (
                              <span style={{ marginTop: 4, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: isDark ? '#333' : '#e9ecef', color: 'var(--text-muted)' }}>
                                Non affecté
                              </span>
                            )
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.statut ? '#19875420' : '#DC354520', color: u.statut ? '#198754' : '#DC3545' }}>
                          {u.statut ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <ActionMenu 
                            options={[
                              { label: 'Affecter (Événement)', icon: 'bi-link', color: '#10b981', hidden: u.role !== 'agent', onClick: () => ouvrirAffecter(u) },
                              { divider: true, hidden: u.role !== 'agent' },
                              { label: 'Modifier', icon: 'bi-pencil-fill', color: '#3b82f6', onClick: () => ouvrirEditer(u) },
                              { label: u.statut ? 'Désactiver' : 'Activer', icon: u.statut ? 'bi-slash-circle-fill' : 'bi-check-circle-fill', color: u.statut ? '#f59e0b' : '#10b981', onClick: () => toggle(u.id) },
                              { label: 'Supprimer', icon: 'bi-trash-fill', color: '#ef4444', onClick: () => demanderSuppression(u.id) }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <i className="bi bi-people" style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Créer/Modifier compte (compact 2 colonnes) */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: '24px 28px', width: '100%', maxWidth: 520, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {editingId ? 'Modifier le compte' : 'Créer un compte'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={sauvegarder}>
              {/* Formulaire Responsive */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px' }}>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Nom *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ ...inputStyle, marginTop: 4, padding: '8px 12px', fontSize: 13 }} />
                </div>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} style={{ ...inputStyle, marginTop: 4, padding: '8px 12px', fontSize: 13 }} />
                </div>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ ...inputStyle, marginTop: 4, padding: '8px 12px', fontSize: 13 }} />
                </div>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Téléphone</label>
                  <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} style={{ ...inputStyle, marginTop: 4, padding: '8px 12px', fontSize: 13 }} />
                </div>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Mot de passe {editingId ? '' : '*'}
                  </label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} placeholder={editingId ? '(Inchangé)' : ''} style={{ ...inputStyle, marginTop: 4, padding: '8px 12px', fontSize: 13 }} />
                </div>
                <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 200 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Sexe</label>
                  <CustomSelect 
                    value={form.sexe} 
                    onChange={(val) => setForm({ ...form, sexe: val })} 
                    placeholder="--"
                    options={[
                      { value: 'M', label: 'Homme (M)' },
                      { value: 'F', label: 'Femme (F)' }
                    ]}
                    style={{ marginTop: 4, padding: '8px 12px' }}
                  />
                </div>
              </div>
              {/* Rôle en pleine largeur */}
              <div style={{ flex: '1 1 100%', marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Rôle *</label>
                <CustomSelect 
                  value={form.role} 
                  onChange={(val) => setForm({ ...form, role: val })} 
                  required
                  placeholder="Sélectionnez un rôle"
                  options={[
                    { value: 'participant', label: 'Participant', icon: 'bi-person-fill', color: '#3b82f6' },
                    { value: 'agent', label: 'Agent', icon: 'bi-person-badge-fill', color: '#10b981' },
                    { value: 'organisateur', label: 'Organisateur', icon: 'bi-briefcase-fill', color: '#8b5cf6' },
                    { value: 'admin', label: 'Administrateur', icon: 'bi-shield-fill-check', color: '#ef4444' }
                  ]}
                  style={{ marginTop: 4, padding: '8px 12px' }}
                />
              </div>
              {/* Boutons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px', background: 'var(--primary)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
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
                Affecter {users.find(u => u.id === affect.agent_id)?.name}
              </h3>
              <button onClick={() => setShowAffect(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            <form onSubmit={affecterAgent}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Événements *</label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 8, padding: 12, backgroundColor: isDark ? '#252839' : '#f7fafc' }}>
                  {evenements.filter((e) => e.statut === 'actif').length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Aucun événement actif.</div>
                  ) : (
                    evenements.filter((e) => e.statut === 'actif').map((e) => (
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

      {/* Modal Supprimer */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dc354515', color: '#dc3545', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="bi bi-exclamation-triangle" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>Confirmer la suppression</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, margin: '0 0 24px' }}>
              Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, background: isDark ? '#161b2d' : '#f8fafd', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={confirmerSuppression} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#dc3545', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Suppression…' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Affectations */}
      {detailsUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Affectations de {detailsUser.name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{detailsUser.agent_evenements?.length || 0} événement(s)</p>
              </div>
              <button onClick={() => setDetailsUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {detailsUser.agent_evenements && detailsUser.agent_evenements.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detailsUser.agent_evenements.map(ev => (
                    <li key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, background: isDark ? '#252839' : '#f8fafd', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ev.titre}</div>
                        {ev.date && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}><i className="bi bi-calendar me-1"></i> {new Date(ev.date).toLocaleDateString('fr-FR')}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aucune affectation trouvée.</p>
              )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button onClick={() => setDetailsUser(null)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}