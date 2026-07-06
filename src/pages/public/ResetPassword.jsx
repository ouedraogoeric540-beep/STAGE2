import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import Logo from '../../components/common/Logo'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Extract token and email from URL
    const params = new URLSearchParams(location.search)
    const urlToken = params.get('token')
    const urlEmail = params.get('email')

    if (urlToken && urlEmail) {
      setToken(urlToken)
      setEmail(urlEmail)
    } else {
      setError('Lien de réinitialisation invalide ou manquant.')
    }
  }, [location])

  const renderError = (field) => {
    if (errors[field]) {
      return (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
          {errors[field][0]}
        </div>
      )
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrors({})

    if (password !== passwordConfirmation) {
      setErrors({ password: ['Les mots de passe ne correspondent pas.'] })
      setLoading(false)
      return
    }

    try {
      await api.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      })
      toast.success('Mot de passe réinitialisé avec succès !')
      navigate('/login')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--bg-body)',
      padding: 20
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        backgroundColor: 'var(--bg-surface)',
        padding: 40, borderRadius: 24,
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.08)',
        border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Nouveau mot de passe
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 30 }}>
          Veuillez saisir votre nouveau mot de passe ci-dessous.
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: 16, borderRadius: 12, marginBottom: 24,
            fontSize: 14, fontWeight: 500
          }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Nouveau mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-lock" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if(errors.password) setErrors({...errors, password: null})
                }}
                style={{
                  width: '100%', padding: '12px 16px 12px 45px',
                  borderRadius: 12, border: `1px solid ${errors.password ? '#ef4444' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                  backgroundColor: isDark ? '#0b0d14' : '#f8fafc',
                  color: 'var(--text-primary)', outline: 'none'
                }}
                placeholder="Min. 8 caractères"
              />
            </div>
            {renderError('password')}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Confirmer le mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 45px',
                  borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  backgroundColor: isDark ? '#0b0d14' : '#f8fafc',
                  color: 'var(--text-primary)', outline: 'none'
                }}
                placeholder="Répétez le mot de passe"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !email}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
              opacity: (loading || !token || !email) ? 0.7 : 1, transition: 'all 0.2s',
              marginBottom: 20
            }}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <Link to="/login" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <i className="bi bi-arrow-left me-1"></i> Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
