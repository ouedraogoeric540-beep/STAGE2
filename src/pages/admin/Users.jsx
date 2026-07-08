import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import ActionMenu from '../../components/common/ActionMenu'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/common/ConfirmModal'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'
import toast from 'react-hot-toast'

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
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors] = useState({})
  
  const getError = (field) => errors[field] ? errors[field][0] : null;

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
    setErrors({})
    setForm({ name: '', prenom: '', sexe: '', email: '', password: '', role: 'organisateur', telephone: '' })
    setShowModal(true)
  }

  const ouvrirEditer = (u) => {
    setEditingId(u.id)
    setErrors({})
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
    setErrors({})
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
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(apiErrors)
        toast.error('Veuillez corriger les erreurs signalées')
      }
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const roleColor = { admin: '#E83E8C', organisateur: '#0D6EFD', agent: '#198754', participant: '#64748b' }

  return (
    <Layout title="Utilisateurs">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>Utilisateurs</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: 4 }}>{users.length} compte(s) trouvé(s)</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select 
              value={filtre} 
              onChange={(e) => { 
                const val = e.target.value;
                setFiltre(val); 
                setSearchParams(val ? { role: val } : {});
              }}
              options={[
                { value: '', label: 'Tous les rôles' },
                { value: 'admin', label: 'Admin' },
                { value: 'organisateur', label: 'Organisateur' },
                { value: 'agent', label: 'Agent' },
                { value: 'participant', label: 'Participant' }
              ]}
              containerStyle={{ minWidth: 180 }}
            />
            <Button onClick={ouvrirCreer} variant="primary" icon="bi-person-plus">
              Créer un compte
            </Button>
          </div>
        </div>

        {/* Tableau */}
        <DashboardCard noPadding={true}>
          <DashboardTable 
            headers={['Utilisateur', 'Contact', 'Rôle', 'Statut', 'Affectations', 'Actions']}
            isEmpty={!loading && users.length === 0}
            emptyText="Aucun utilisateur trouvé"
            emptyIcon="bi-people"
          >
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="sp-spinner mx-auto" />
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} 
                  style={{ borderTop: '1px solid var(--border)', transition: 'var(--transition-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: roleColor[u.role] || '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {u.email && <div style={{ marginBottom: '4px' }}><i className="bi bi-envelope"/> {u.email}</div>}
                  {u.telephone && <div><i className="bi bi-telephone"/> {u.telephone}</div>}
                  {!u.email && !u.telephone && '—'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'organisateur' ? 'primary' : u.role === 'agent' ? 'success' : 'secondary'}>
                    {u.role}
                  </Badge>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <Badge variant={u.statut ? 'success' : 'danger'} outline>
                    {u.statut ? 'ACTIF' : 'INACTIF'}
                  </Badge>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {u.role === 'agent' ? (
                    u.agent_evenements && u.agent_evenements.length > 0 ? (
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}><i className="bi bi-link-45deg" /> {u.agent_evenements.length} évent(s)</span>
                        <Button onClick={() => setDetailsUser(u)} variant="soft" size="sm" style={{ padding: '4px 8px', fontSize: '11px' }}>Détails</Button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}><i className="bi bi-exclamation-circle" /> Non affecté</span>
                    )
                  ) : '—'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <ActionMenu 
                    options={[
                      { label: 'Affecter (Événement)', icon: 'bi-link', color: 'var(--success)', hidden: u.role !== 'agent', onClick: () => ouvrirAffecter(u) },
                      { divider: true, hidden: u.role !== 'agent' },
                      { label: 'Modifier', icon: 'bi-pencil-fill', color: 'var(--primary)', onClick: () => ouvrirEditer(u) },
                      { label: u.statut ? 'Désactiver' : 'Activer', icon: u.statut ? 'bi-slash-circle-fill' : 'bi-check-circle-fill', color: u.statut ? 'var(--warning)' : 'var(--success)', onClick: () => toggle(u.id) },
                      { label: 'Supprimer', icon: 'bi-trash-fill', color: 'var(--danger)', onClick: () => demanderSuppression(u.id) }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </DashboardTable>
        </DashboardCard>
      </div>

      {/* Modal Créer/Modifier compte */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editingId ? 'Modifier le compte' : 'Créer un compte'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={sauvegarder} loading={saving}>{editingId ? 'Modifier' : 'Créer'}</Button>
          </>
        }
      >
        <form id="user-form" onSubmit={sauvegarder} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Input label="Nom *" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={getError('name')} required />
          <Input label="Prénom" name="prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} error={getError('prenom')} />
          <Input label="Email *" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={getError('email')} required />
          <Input label="Téléphone" name="telephone" type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} error={getError('telephone')} />
          
          <div style={{ position: 'relative' }}>
            <Input 
              label={`Mot de passe ${editingId ? '' : '*'}`} 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              error={getError('password')} 
              required={!editingId} 
              placeholder={editingId ? '(Inchangé)' : ''} 
              style={{ paddingRight: '40px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: getError('password') ? '38px' : '44px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
            </button>
          </div>

          <Select 
            label="Sexe"
            value={form.sexe} 
            onChange={(e) => setForm({ ...form, sexe: e.target.value })} 
            options={[
              { value: '', label: '--' },
              { value: 'M', label: 'Homme (M)' },
              { value: 'F', label: 'Femme (F)' }
            ]}
            error={getError('sexe')}
          />
          
          <div style={{ gridColumn: '1 / -1' }}>
            <Select 
              label="Rôle *"
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })} 
              options={[
                { value: 'participant', label: 'Participant' },
                { value: 'agent', label: 'Agent' },
                { value: 'organisateur', label: 'Organisateur' },
                { value: 'admin', label: 'Administrateur' }
              ]}
              error={getError('role')}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal Affecter */}
      <Modal
        isOpen={showAffect}
        onClose={() => setShowAffect(false)}
        title={`Affecter ${users.find(u => u.id === affect.agent_id)?.name}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAffect(false)}>Annuler</Button>
            <Button variant="success" onClick={affecterAgent} loading={saving}>Affecter</Button>
          </>
        }
      >
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Événements actifs *</label>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid var(--border)`, borderRadius: 'var(--radius-md)', padding: 12, backgroundColor: 'var(--bg-input)' }}>
            {evenements.filter((e) => e.statut === 'actif').length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Aucun événement actif.</div>
            ) : (
              evenements.filter((e) => e.statut === 'actif').map((e) => (
                <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid var(--border)`, margin: 0 }}>
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
      </Modal>

      {/* Modal Supprimer */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible."
        onConfirm={confirmerSuppression}
        onCancel={() => setDeleteId(null)}
        loading={saving}
        isDanger={true}
      />

      {/* Modal Détails Affectations */}
      <Modal
        isOpen={!!detailsUser}
        onClose={() => setDetailsUser(null)}
        title={`Affectations de ${detailsUser?.name}`}
        size="sm"
        footer={<Button variant="primary" onClick={() => setDetailsUser(null)}>Fermer</Button>}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {detailsUser?.agent_evenements && detailsUser.agent_evenements.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {detailsUser.agent_evenements.map(ev => (
                <li key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: `1px solid var(--border)` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand-glow)', color: 'var(--brand-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    <i className="bi bi-calendar-event"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ev.titre}</div>
                    {ev.date && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}><i className="bi bi-calendar me-1"></i> {new Date(ev.date).toLocaleDateString('fr-FR')}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aucune affectation trouvée.</p>
          )}
        </div>
      </Modal>
    </Layout>
  )
}