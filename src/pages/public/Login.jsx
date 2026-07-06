import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../../components/common/Logo'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'

export default function Login() {
  const { login }  = useAuth()
  const { isDark } = useTheme()
  const navigate   = useNavigate()

  const [form, setForm]       = useState({ login: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }
  
  const renderError = (field) => errors[field] ? <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[field][0]}</div> : null;

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const user = await login(form.login, form.password)
      toast.success('Connexion réussie !')
      if (user.role === 'admin')             navigate('/admin')
      else if (user.role === 'organisateur') navigate('/organisateur')
      else if (user.role === 'agent')        navigate('/agent')
      else                                   navigate('/mes-tickets')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) {
        setErrors(data.errors)
        toast.error('Veuillez corriger les erreurs signalées.')
        return
      }
      // Compte bloqué → redirection vers la page dédiée
      if (data?.compte_bloque) {
        navigate('/compte-bloque', {
          state: {
            minutes_restantes: data.minutes_restantes ?? 120,
            bloque_jusqu_a: data.bloque_jusqu_a,
          }
        })
        return
      }
      // Afficher les tentatives restantes
      if (data?.tentatives_restantes !== undefined) {
        toast.error(`Identifiants incorrects. Il vous reste ${data.tentatives_restantes} tentative(s).`)
      } else {
        toast.error(data?.message || 'Identifiants incorrects.')
      }
    } finally { setLoading(false) }
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
      backgroundColor: 'var(--bg-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 360, animation: 'fadeIn 0.4s ease', position: 'relative' }}>
        <div className="card-custom shadow-lg" style={{ position: 'relative', padding: '24px' }}>
          
          {/* Toggle thème placé à l'intérieur de la carte */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
            <ThemeToggle />
            <i className="bi bi-moon-stars-fill" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
          </div>

          {/* Logo */}
          <div className="text-center" style={{ marginBottom: 16 }}>
            <Logo size="sm" showTagline />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 4 }}>
            Connexion
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
            Connectez-vous pour accéder à votre espace
          </p>

          <form onSubmit={submit}>
            {/* Identifiant ou Email */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Email ou Identifiant</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person-fill" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text" name="login" value={form.login} onChange={handle}
                  style={{ ...inputStyle, paddingLeft: 36, ...(errors.login ? { borderColor: '#ef4444' } : {}) }}
                  placeholder="vous@exemple.com ou ORG-..." required
                />
              </div>
              {renderError('login')}
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handle}
                  style={{ ...inputStyle, paddingLeft: 42, paddingRight: 42, ...(errors.password ? { borderColor: '#ef4444' } : {}) }}
                  placeholder="••••••••" required
                />
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {renderError('password')}
            </div>

            {/* Remember + Forgot */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input" type="checkbox"
                  id="remember" checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="remember"
                  style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Se souvenir de moi
                </label>
              </div>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--brand-color)', textDecoration: 'none', fontWeight: 600 }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton */}
            <button
              type="submit" disabled={loading}
              className="btn btn-brand w-100"
              style={{ padding: '12px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Connexion…
                </>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2" /> Se connecter</>
              )}
            </button>
          </form>

          <div className="text-center mt-3" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--brand-color)', fontWeight: 700, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </div>

          <div className="text-center mt-2">
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12 }}>
              <i className="bi bi-arrow-left me-1" /> Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}