import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import Logo from '../../components/common/Logo'

export default function ForgotPassword() {
  const { isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await api.post('/forgot-password', { email })
      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.')
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
          Mot de passe oublié
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 30 }}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: 16, borderRadius: 12, marginBottom: 24,
            fontSize: 14, fontWeight: 500
          }}>
            <i className="bi bi-check-circle me-2"></i>
            Un lien de réinitialisation a été envoyé à votre adresse email.
          </div>
        )}

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
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-envelope" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px 12px 45px',
                  borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  backgroundColor: isDark ? '#0b0d14' : '#f8fafc',
                  color: 'var(--text-primary)', outline: 'none'
                }}
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
              marginBottom: 20
            }}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>

        <Link to="/login" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <i className="bi bi-arrow-left me-1"></i> Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
