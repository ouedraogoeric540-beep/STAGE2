import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import CustomSelect from '../../components/common/CustomSelect'
import Logo from '../../components/common/Logo'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'

export default function Register() {
  const { isDark } = useTheme()
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const [organisateurSuccess, setOrganisateurSuccess] = useState(null)

  const [form, setForm] = useState({
    name: '', prenom: '', sexe: '', email: '', telephone: '',
    password: '', password_confirmation: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('participant')
  const [errors, setErrors] = useState({})

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }
  
  const renderError = (field) => errors[field] ? <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[field][0]}</div> : null;

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    if (activeTab === 'participant') {
      if (form.password !== form.password_confirmation) {
        toast.error('Les mots de passe ne correspondent pas.')
        return
      }
      setLoading(true)
      try {
        await register(form)
        toast.success('Compte créé avec succès !')
        navigate('/mes-tickets')
      } catch (err) {
        const apiErrors = err.response?.data?.errors
        if (apiErrors) {
          setErrors(apiErrors)
          toast.error('Veuillez corriger les erreurs signalées.')
        }
        else toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const res = await api.post('/register-organisateur', { name: form.name, email: form.email })
        toast.success(res.data.message || 'Compte organisateur créé !')
        setOrganisateurSuccess({
          identifiant: res.data.identifiant,
          temp_password: res.data.temp_password
        })
      } catch (err) {
        const apiErrors = err.response?.data?.errors
        if (apiErrors) {
          setErrors(apiErrors)
          toast.error('Veuillez corriger les erreurs signalées.')
        }
        else toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.')
      } finally {
        setLoading(false)
      }
    }
  }

  const inputStyle = {
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    color: isDark ? '#e8eaf0' : '#1a202c',
    borderRadius: 8, padding: '8px 12px',
    width: '100%', fontSize: 14, outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)'
        : 'linear-gradient(135deg, #f0f2f5 0%, #e8eef7 100%)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 460,
        backgroundColor: isDark ? '#1e2130' : '#ffffff',
        borderRadius: 16,
        border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
        padding: '20px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.5s ease',
      }}>
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          <i className="bi bi-moon-stars-fill" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <Logo size="sm" showTagline />
        </div>

        {!organisateurSuccess ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 2 }}>
          Créer mon compte
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
          Inscrivez-vous pour accéder à vos tickets ou gérer vos événements
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, marginBottom: 16 }}>
          <button 
            type="button"
            onClick={() => setActiveTab('participant')}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'participant' ? '2px solid #0D6EFD' : '2px solid transparent', color: activeTab === 'participant' ? '#0D6EFD' : 'var(--text-muted)', fontWeight: activeTab === 'participant' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Participant
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('organisateur')}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'organisateur' ? '2px solid #0D6EFD' : '2px solid transparent', color: activeTab === 'organisateur' ? '#0D6EFD' : 'var(--text-muted)', fontWeight: activeTab === 'organisateur' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Organisateur
          </button>
        </div>

        <form onSubmit={submit}>
          {/* Row 1: Nom & Prénom */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Nom *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" value={form.name} onChange={handle} required
                  placeholder="Votre nom"
                  style={{ ...inputStyle, paddingLeft: 36, ...(errors.name ? { borderColor: '#ef4444' } : {}) }} />
              </div>
              {renderError('name')}
            </div>

            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Prénom</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="prenom" value={form.prenom} onChange={handle}
                  placeholder="Votre prénom"
                  style={{ ...inputStyle, paddingLeft: 36, ...(errors.prenom ? { borderColor: '#ef4444' } : {}) }} />
              </div>
              {renderError('prenom')}
            </div>
          </div>

          {activeTab === 'participant' && (
            <>
              {/* Sexe & Téléphone */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Sexe</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-gender-ambiguous" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 2 }} />
                    <CustomSelect
                      name="sexe"
                      value={form.sexe}
                      onChange={(val) => {
                        setForm({ ...form, sexe: val })
                        if (errors.sexe) setErrors({ ...errors, sexe: null })
                      }}
                      options={[
                        { value: 'M', label: 'Homme' },
                        { value: 'F', label: 'Femme' }
                      ]}
                    />
                  </div>
                  {renderError('sexe')}
                </div>

                <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Téléphone</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-telephone" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="tel" name="telephone" value={form.telephone} onChange={handle}
                      placeholder="+226 00 00 00 00"
                      style={{ ...inputStyle, paddingLeft: 36, ...(errors.telephone ? { borderColor: '#ef4444' } : {}) }} />
                  </div>
                  {renderError('telephone')}
                </div>
              </div>

              {/* Email (Full width) */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Adresse email *</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" name="email" value={form.email} onChange={handle} required
                    placeholder="vous@exemple.com"
                    style={{ ...inputStyle, paddingLeft: 36, ...(errors.email ? { borderColor: '#ef4444' } : {}) }} />
                </div>
                {renderError('email')}
              </div>

              {/* Row 3: Mots de passe */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle} required
                      placeholder="Min. 8 car."
                      style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36, ...(errors.password ? { borderColor: '#ef4444' } : {}) }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  {renderError('password')}
                </div>

                <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Confirmer *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={showConf ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handle} required
                      placeholder="Confirmer"
                      style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36, ...(errors.password_confirmation ? { borderColor: '#ef4444' } : {}) }} />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                      <i className={`bi ${showConf ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                  {renderError('password_confirmation')}
                </div>
              </div>
            </>
          )}

          {activeTab === 'organisateur' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Adresse email *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" value={form.email} onChange={handle} required
                  placeholder="vous@exemple.com"
                  style={{ ...inputStyle, paddingLeft: 36, ...(errors.email ? { borderColor: '#ef4444' } : {}) }} />
              </div>
              {renderError('email')}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Vous recevrez un email contenant votre identifiant et votre mot de passe temporaire pour vous connecter.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-brand w-100" style={{
            padding: '13px',
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Création…
              </>
            ) : (
              <><i className="bi bi-person-plus" /> {activeTab === 'participant' ? "S'inscrire" : "Créer mon compte organisateur"}</>
            )}
          </button>
        </form>
        </>
        ) : (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>
              <i className="bi bi-check-lg" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Compte créé !</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Voici vos accès temporaires. Copiez-les avant de continuer.</p>
            
            <div style={{ background: isDark ? '#1a1d27' : '#f8fafc', padding: '16px', borderRadius: 12, marginBottom: 24, textAlign: 'left', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Identifiant</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? '#252839' : '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{organisateurSuccess.identifiant}</span>
                  <button onClick={() => { navigator.clipboard.writeText(organisateurSuccess.identifiant); toast.success('Copié !') }} style={{ background: 'none', border: 'none', color: '#0D6EFD', cursor: 'pointer' }}><i className="bi bi-copy" /></button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Mot de passe temporaire</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? '#252839' : '#fff', padding: '8px 12px', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{organisateurSuccess.temp_password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(organisateurSuccess.temp_password); toast.success('Copié !') }} style={{ background: 'none', border: 'none', color: '#0D6EFD', cursor: 'pointer' }}><i className="bi bi-copy" /></button>
                </div>
              </div>
            </div>

            <button 
              onClick={async () => {
                try {
                  await login(organisateurSuccess.identifiant, organisateurSuccess.temp_password)
                  navigate('/organisateur/dashboard')
                } catch (err) {
                  toast.error("Erreur de connexion auto.")
                }
              }} 
              className="btn btn-brand w-100" 
              style={{ padding: '13px', fontSize: 15, fontWeight: 600, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Continuer vers mon espace <i className="bi bi-arrow-right" />
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--brand-color)', fontWeight: 700, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            <i className="bi bi-arrow-left" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}