import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Layout from '../../components/common/Layout'
import CustomSelect from '../../components/common/CustomSelect'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function Profil() {
  const { user, setUser } = useAuth()
  const { isDark } = useTheme()
  
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

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  const [prevUser, setPrevUser] = useState(user)

  // Initialiser les données
  if (user !== prevUser) {
    setPrevUser(user)
    if (user) {
      setProfileForm({
        name: user.name || '',
        prenom: user.prenom || '',
        sexe: user.sexe || '',
        email: user.email || '',
        telephone: user.telephone || '' // Si dispo
      })
    }
  }

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const submitProfile = async (e) => {
    e.preventDefault()
    setLoadingProfile(true)
    try {
      const res = await api.put('/user/profile', profileForm)
      toast.success(res.data.message)
      setUser(res.data.user) // Mettre à jour le context
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(e => toast.error(e[0]))
      } else {
        toast.error('Erreur lors de la mise à jour du profil')
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setLoadingPassword(true)
    try {
      const res = await api.put('/user/password', passwordForm)
      toast.success(res.data.message)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(e => toast.error(e[0]))
      } else {
        toast.error('Erreur lors de la modification du mot de passe')
      }
    } finally {
      setLoadingPassword(false)
    }
  }

  const inputStyle = {
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    color: isDark ? '#e8eaf0' : '#1a202c',
    borderRadius: 10, padding: '12px 16px',
    width: '100%', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  }

  const cardStyle = {
    backgroundColor: isDark ? '#1e2130' : '#ffffff',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    borderRadius: 20, padding: 32,
    boxShadow: isDark ? 'none' : '0 8px 24px rgba(0,0,0,0.04)',
    marginBottom: 24,
    animation: 'fadeIn 0.4s ease'
  }

  return (
    <Layout title="Mon Profil">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Informations Personnelles */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              <i className="bi bi-person" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Informations personnelles</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mettez à jour vos informations de contact</div>
            </div>
          </div>

          <form onSubmit={submitProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nom</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} required style={{ ...inputStyle, paddingLeft: 42 }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Prénom</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" name="prenom" value={profileForm.prenom} onChange={handleProfileChange} style={{ ...inputStyle, paddingLeft: 42 }} />
                  </div>
                </div>
              </div>

              {user?.identifiant && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Identifiant (Organisateur)</label>
                  <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <i className="bi bi-hash" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" value={user.identifiant} readOnly style={{ ...inputStyle, paddingLeft: 42, backgroundColor: isDark ? '#1a1d27' : '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(user.identifiant);
                        toast.success('Identifiant copié !');
                      }} 
                      style={{ padding: '0 16px', borderRadius: 10, border: 'none', background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="bi bi-copy" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Sexe</label>
                <div style={{ position: 'relative' }}>
                  <CustomSelect 
                    value={profileForm.sexe}
                    onChange={(val) => handleProfileChange({ target: { name: 'sexe', value: val } })}
                    placeholder="Sélectionner"
                    options={[
                      { value: 'M', label: 'Homme' },
                      { value: 'F', label: 'Femme' }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required style={{ ...inputStyle, paddingLeft: 42 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-telephone" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" name="telephone" value={profileForm.telephone} onChange={handleProfileChange} placeholder="+226 XX XX XX XX" style={{ ...inputStyle, paddingLeft: 42 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={loadingProfile} style={{
                padding: '12px 24px', background: '#0D6EFD', border: 'none', borderRadius: 10, color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: loadingProfile ? 'not-allowed' : 'pointer',
                opacity: loadingProfile ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8
              }}>
                {loadingProfile ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check2" />}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>

        {/* Mot de passe */}
        <div style={{ ...cardStyle, animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,62,140,0.1)', color: '#E83E8C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              <i className="bi bi-shield-lock" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Mot de passe</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Assurez-vous d'utiliser un mot de passe sécurisé</div>
            </div>
          </div>

          <form onSubmit={submitPassword}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mot de passe actuel</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" name="current_password" value={passwordForm.current_password} onChange={handlePasswordChange} required style={{ ...inputStyle, paddingLeft: 42 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-key" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" name="password" value={passwordForm.password} onChange={handlePasswordChange} required minLength={8} style={{ ...inputStyle, paddingLeft: 42 }} />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-key-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" name="password_confirmation" value={passwordForm.password_confirmation} onChange={handlePasswordChange} required minLength={8} style={{ ...inputStyle, paddingLeft: 42 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={loadingPassword} style={{
                padding: '12px 24px', background: '#E83E8C', border: 'none', borderRadius: 10, color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: loadingPassword ? 'not-allowed' : 'pointer',
                opacity: loadingPassword ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8
              }}>
                {loadingPassword ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-shield-check" />}
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  )
}
