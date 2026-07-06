import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import CustomSelect from '../../components/common/CustomSelect'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Parametres() {
  const location = useLocation()
  const { user, setUser } = useAuth()
  const { isDark, toggleTheme, paletteName, setPalette, palettes, currentPalette } = useTheme()
  
  const getTabFromHash = (hash) => {
    if (!hash) return 'apparence'
    const tab = hash.replace('#', '')
    return ['profil', 'apparence', 'notifications', 'securite', 'administration'].includes(tab) ? tab : 'apparence'
  }

  const [activeTab, setActiveTab] = useState(() => getTabFromHash(location.hash))

  // Synchronisation avec le router n'est pas strictement nécessaire ici
  // puisque setActiveTab est appelé directement au clic sur les onglets.
  const [notifications, setNotifications] = useState(() => {
    // Initialiser avec les données du backend s'il y en a
    if (user?.notif_prefs) {
      return user.notif_prefs
    }
    return {
      ticketPurchased: true,
      agentAssigned: true,
      securityAlert: true,
    }
  })

  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNotifChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/user/notifications', notifications)
      toast.success(res.data.message || 'Préférences enregistrées')
      if (res.data.user) {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      }
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde des notifications')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // --- EDITION PROFIL ---
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [loadingSecondPassword, setLoadingSecondPassword] = useState(false)

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingSecondPassword, setIsEditingSecondPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    prenom: user?.prenom || '',
    sexe: user?.sexe || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [secondPasswordForm, setSecondPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  
  const [showPasswords, setShowPasswords] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoadingProfile(true)
    try {
      const payload = { ...profileForm }
      if (payload.sexe === '') payload.sexe = null
      
      const res = await api.put('/user/profile', payload)
      toast.success(res.data.message || 'Profil mis à jour')
      setUser(res.data.user) // Met à jour le contexte
      localStorage.setItem('user', JSON.stringify(res.data.user)) // Persiste la modification
      setIsEditingProfile(false)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]))
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  // --- EDITION MOT DE PASSE ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.password_confirmation) {
      return toast.error('Les mots de passe ne correspondent pas')
    }
    setLoadingPassword(true)
    try {
      const res = await api.put('/user/password', passwordForm)
      toast.success(res.data.message || 'Mot de passe mis à jour')
      setIsEditingPassword(false)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]))
      } else {
        toast.error('Erreur lors de la modification du mot de passe')
      }
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleUpdateSecondPassword = async (e) => {
    e.preventDefault()
    if (secondPasswordForm.password !== secondPasswordForm.password_confirmation) {
      return toast.error('Les mots de passe ne correspondent pas.')
    }
    setLoadingSecondPassword(true)
    try {
      await api.put('/admin/second-password', secondPasswordForm)
      toast.success('Second mot de passe mis à jour avec succès')
      setSecondPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      setIsEditingSecondPassword(false)
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de la mise à jour'
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoadingSecondPassword(false)
    }
  }

  const surf = { bg: isDark ? 'var(--bg-surface)' : '#f8fafc' }
  const cardBg = isDark ? 'var(--bg-card)' : '#ffffff'
  const borderColor = isDark ? 'var(--border)' : '#e2e8f0'

  const tabs = [
    { id: 'profil', icon: 'bi-person-fill', label: 'Mon Profil' },
    { id: 'apparence', icon: 'bi-palette-fill', label: 'Apparence' },
    { id: 'notifications', icon: 'bi-bell-fill', label: 'Notifications' },
    { id: 'securite', icon: 'bi-shield-fill-check', label: 'Sécurité' },
    ...(user?.role === 'admin' ? [{ id: 'administration', icon: 'bi-database-fill-down', label: 'Administration' }] : []),
  ]

  const notifItems = [
    { name: 'ticketPurchased', icon: 'bi-ticket-detailed-fill', title: "Achats & Réservations", desc: 'Recevoir les billets par e-mail' },
    ...(user?.role === 'agent' ? [{ name: 'agentAssigned', icon: 'bi-person-badge-fill', title: 'Affectations (Agents)', desc: 'Être notifié d\'une nouvelle affectation à un événement' }] : []),
    { name: 'securityAlert', icon: 'bi-shield-fill-exclamation', title: 'Alertes de sécurité', desc: 'Connexions suspectes et blocage de compte' },
  ]

  const paletteLabels = {
    blue: 'Bleu Océan', pink: 'Rose Framboise', red: 'Rouge Corail',
    green: 'Vert Émeraude', purple: 'Violet Améthyste',
  }

  return (
    <Layout title="Paramètres">
      <div className="animate-fadeIn" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32 }}>
        
        {/* ── MENU LATÉRAL ── */}
        <div style={{ width: isMobile ? '100%' : 260, flexShrink: 0 }}>
          {!isMobile && <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>Paramètres</h2>}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column', 
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: isMobile ? 8 : 6,
            paddingBottom: isMobile ? 16 : 0,
            borderBottom: isMobile ? `1px solid ${borderColor}` : 'none',
            marginBottom: isMobile ? 24 : 0
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, '', `#${tab.id}`);
                }}
                style={{
                  textAlign: 'center', 
                  padding: isMobile ? '8px 12px' : '12px 18px', 
                  borderRadius: 20, // Plus arrondi (façon pilule)
                  background: activeTab === tab.id ? `${currentPalette.primary}15` : 'transparent',
                  color: activeTab === tab.id ? currentPalette.primary : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  border: isMobile && activeTab === tab.id ? `1px solid ${currentPalette.primary}30` : '1px solid transparent', 
                  cursor: 'pointer',
                  display: 'inline-flex', 
                  flexDirection: 'row',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  transition: 'all 0.2s ease',
                  fontSize: isMobile ? 13 : 15,
                  width: 'auto',
                  flexShrink: 0
                }}
              >
                <i className={`bi ${tab.icon}`} style={{ fontSize: isMobile ? 16 : 18 }} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENU DES ONGLETS ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* APPARENCE */}
          {activeTab === 'apparence' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Apparence</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Personnalisez l'interface à votre image.</div>
              </div>

              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Thème de l'application</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Basculez entre le mode clair et sombre.</div>
                  </div>
                  <button onClick={toggleTheme} className={`sp-toggle ${isDark ? 'dark' : ''}`} />
                </div>

                <hr style={{ borderTop: `1px solid ${borderColor}`, margin: '0 0 24px 0', opacity: 0.5 }} />

                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Couleur principale</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                  {Object.entries(palettes).map(([key, pal]) => (
                    <button
                      key={key}
                      onClick={() => { setPalette(key); toast.success(`Couleur changée`); }}
                      title={paletteLabels[key]}
                      style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: pal.swatch, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: paletteName === key ? `0 0 0 4px ${cardBg}, 0 0 0 6px ${pal.swatch}` : 'none',
                        transition: 'all 0.2s', transform: paletteName === key ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {paletteName === key && <i className="bi bi-check" style={{ color: '#fff', fontSize: 24 }} />}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 20, borderRadius: 12, background: surf.bg, border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Aperçu</div>
                  <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                    <div style={{ padding: '8px 16px', background: currentPalette.gradient, color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Bouton Principal</div>
                    <div style={{ padding: '8px 16px', color: currentPalette.primary, borderRadius: 8, fontWeight: 600, fontSize: 14, border: `1px solid ${currentPalette.primary}`, textAlign: 'center' }}>Bouton Secondaire</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Notifications</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Gérez les alertes que vous souhaitez recevoir par e-mail.</div>
              </div>

              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: isMobile ? 16 : 24 }}>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {notifItems.map((item, index) => (
                      <div key={item.name}>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 0 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: surf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                              <i className={`bi ${item.icon}`} style={{ fontSize: 18 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                            </div>
                          </div>
                          
                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleNotifChange(item.name)}
                            style={{
                              width: 44, height: 24, borderRadius: 12, position: 'relative',
                              background: notifications[item.name] ? currentPalette.primary : 'var(--border)',
                              border: 'none', cursor: 'pointer', transition: 'background 0.3s'
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', background: '#fff',
                              position: 'absolute', top: 3, left: notifications[item.name] ? 23 : 3,
                              transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                          </button>
                        </div>
                        {index !== notifItems.length - 1 && <hr style={{ borderTop: `1px solid ${borderColor}`, margin: '20px 0 0 0', opacity: 0.5 }} />}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: currentPalette.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PROFIL */}
          {activeTab === 'profil' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Mon Profil</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Gérez vos informations personnelles.</div>
              </div>
              
              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: isMobile ? 16 : 24, position: 'relative' }}>
                <div style={{ 
                  width: isMobile ? 72 : 88, 
                  height: isMobile ? 72 : 88, 
                  borderRadius: '50%', 
                  background: currentPalette.gradient || currentPalette.primary, 
                  color: '#fff', 
                  fontSize: isMobile ? 28 : 36, 
                  fontWeight: 800,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 24px auto', 
                  boxShadow: `0 10px 25px -5px ${currentPalette.primary}70`,
                  border: `4px solid ${isDark ? 'var(--bg-surface)' : '#fff'}`,
                  textTransform: 'uppercase',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>

                {!isEditingProfile ? (
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>{user?.name || 'Utilisateur'} {user?.prenom || ''}</h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24, marginTop: 4 }}>{user?.email || 'email@example.com'}</div>
                    <button onClick={() => {
                      setProfileForm({
                        name: user?.name || '',
                        prenom: user?.prenom || '',
                        sexe: user?.sexe || '',
                        email: user?.email || '',
                        telephone: user?.telephone || ''
                      });
                      setIsEditingProfile(true);
                    }} style={{ padding: '10px 20px', background: surf.bg, border: `1px solid ${borderColor}`, borderRadius: 8, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <i className="bi bi-pencil-square me-2" /> Modifier mes informations
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} style={{ maxWidth: 450, margin: '0 auto', textAlign: 'left' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Nom *</label>
                        <input 
                          type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surf.bg, color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Prénom</label>
                        <input 
                          type="text" value={profileForm.prenom} onChange={e => setProfileForm({...profileForm, prenom: e.target.value})}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surf.bg, color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Adresse email *</label>
                      <input 
                        type="email" required value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surf.bg, color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: 24 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Sexe</label>
                        <CustomSelect 
                          value={profileForm.sexe} 
                          onChange={(val) => setProfileForm({...profileForm, sexe: val})}
                          placeholder="Sélectionner"
                          options={[
                            { value: 'M', label: 'Homme' },
                            { value: 'F', label: 'Femme' }
                          ]}
                          style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surf.bg }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Téléphone</label>
                        <input 
                          type="tel" value={profileForm.telephone} onChange={e => setProfileForm({...profileForm, telephone: e.target.value})}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: surf.bg, color: 'var(--text-primary)', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setIsEditingProfile(false)} style={{ padding: '10px 16px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                      <button type="submit" disabled={loadingProfile} style={{ padding: '10px 20px', background: currentPalette.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loadingProfile ? 'not-allowed' : 'pointer', opacity: loadingProfile ? 0.7 : 1 }}>
                        {loadingProfile ? 'Sauvegarde...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* SECURITE */}
          {activeTab === 'securite' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Sécurité</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sécurisez votre compte SecurePass.</div>
              </div>

              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24 }}>
                {!isEditingPassword ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Mot de passe</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Gérer votre mot de passe</div>
                    </div>
                    <button onClick={() => setIsEditingPassword(true)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                      Modifier
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword} style={{ marginBottom: 24, padding: 20, background: surf.bg, borderRadius: 12, border: `1px solid ${borderColor}` }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: 15, color: 'var(--text-primary)' }}>Changer le mot de passe</h4>
                    <div style={{ marginBottom: 12, position: 'relative' }}>
                      <input type={showPasswords ? "text" : "password"} placeholder="Mot de passe actuel *" required name="current_password" value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                      <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ marginBottom: 12, position: 'relative' }}>
                      <input type={showPasswords ? "text" : "password"} placeholder="Nouveau mot de passe *" required name="password" value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                      <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ marginBottom: 16, position: 'relative' }}>
                      <input type={showPasswords ? "text" : "password"} placeholder="Confirmer le nouveau mot de passe *" required name="password_confirmation" value={passwordForm.password_confirmation} onChange={e => setPasswordForm({...passwordForm, password_confirmation: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                      <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setIsEditingPassword(false)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                      <button type="submit" disabled={loadingPassword} style={{ padding: '8px 16px', background: currentPalette.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loadingPassword ? 'not-allowed' : 'pointer', opacity: loadingPassword ? 0.7 : 1 }}>
                        {loadingPassword ? 'Chargement...' : 'Mettre à jour'}
                      </button>
                    </div>
                  </form>
                )}

                {user?.role === 'admin' && (
                  <>
                    <hr style={{ borderTop: `1px solid ${borderColor}`, margin: '24px 0', opacity: 0.5 }} />
                    {!isEditingSecondPassword ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Second mot de passe (Admin)</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Gérer le mot de passe de vérification admin</div>
                        </div>
                        <button onClick={() => setIsEditingSecondPassword(true)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 8, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                          Modifier
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateSecondPassword} style={{ marginBottom: 24, padding: 20, background: surf.bg, borderRadius: 12, border: `1px solid ${borderColor}` }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 15, color: 'var(--text-primary)' }}>Changer le second mot de passe</h4>
                        <div style={{ marginBottom: 12, position: 'relative' }}>
                          <input type={showPasswords ? "text" : "password"} placeholder="Second mot de passe actuel *" required value={secondPasswordForm.current_password} onChange={e => setSecondPasswordForm({...secondPasswordForm, current_password: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                          <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ marginBottom: 12, position: 'relative' }}>
                          <input type={showPasswords ? "text" : "password"} placeholder="Nouveau second mot de passe *" required value={secondPasswordForm.password} onChange={e => setSecondPasswordForm({...secondPasswordForm, password: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                          <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ marginBottom: 16, position: 'relative' }}>
                          <input type={showPasswords ? "text" : "password"} placeholder="Confirmer le nouveau second mot de passe *" required value={secondPasswordForm.password_confirmation} onChange={e => setSecondPasswordForm({...secondPasswordForm, password_confirmation: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: cardBg, color: 'var(--text-primary)', outline: 'none' }} />
                          <i className={`bi bi-eye${showPasswords ? '' : '-slash'}`} onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setIsEditingSecondPassword(false)} style={{ padding: '8px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                          <button type="submit" disabled={loadingSecondPassword} style={{ padding: '8px 16px', background: currentPalette.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loadingSecondPassword ? 'not-allowed' : 'pointer', opacity: loadingSecondPassword ? 0.7 : 1 }}>
                            {loadingSecondPassword ? 'Chargement...' : 'Mettre à jour'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                <hr style={{ borderTop: `1px solid ${borderColor}`, margin: '0 0 24px 0', opacity: 0.5 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Authentification à deux facteurs (2FA)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Ajoute une couche de sécurité supplémentaire.</div>
                  </div>
                  <span style={{ padding: '4px 10px', background: 'rgba(220,53,69,0.1)', color: '#DC3545', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Désactivé</span>
                </div>
              </div>
            </div>
          )}

          {/* ADMINISTRATION (Admin Only) */}
          {activeTab === 'administration' && user?.role === 'admin' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Administration</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Outils de gestion avancée pour la plateforme.</div>
              </div>

              <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Sauvegarde globale de la plateforme</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, maxWidth: 500 }}>
                      Génère une archive complète (au format JSON) de toutes les données de la base. Ceci peut prendre quelques secondes.
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const toastId = toast.loading('Génération de la sauvegarde en cours...');
                        const response = await api.get('/admin/backup', { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        // Extract filename from Content-Disposition if available, or generate one
                        let filename = 'backup_securepass.json';
                        const disposition = response.headers['content-disposition'];
                        if (disposition && disposition.indexOf('filename=') !== -1) {
                            filename = disposition.split('filename=')[1].replace(/"/g, '');
                        }
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.success('Sauvegarde téléchargée avec succès !', { id: toastId });
                      } catch (error) {
                        toast.error('Erreur lors du téléchargement de la sauvegarde.');
                        console.error(error);
                      }
                    }} 
                    style={{ 
                      padding: '10px 20px', 
                      background: currentPalette.primary, 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 8, 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0
                    }}
                  >
                    <i className="bi bi-cloud-arrow-down-fill" />
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}