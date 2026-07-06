import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import Logo from '../../components/common/Logo'

export default function VerifySecondPassword() {
  const { isDark } = useTheme()
  const { user, verifySecondPassword, logout } = useAuth()
  const navigate = useNavigate()

  const [hasPassword, setHasPassword] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Modes: 'setup', 'verify', 'forgot', 'reset'
  const [mode, setMode] = useState('verify')

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [otp, setOtp] = useState('')
  
  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState({})
  
  const renderError = (field) => errors[field] ? <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, textAlign: 'left' }}>{errors[field][0]}</div> : null;

  useEffect(() => {
    // Determine if admin has second password configured
    api.get('/me')
      .then((res) => {
        const hasPwd = res.data.has_admin_second_password;
        setHasPassword(hasPwd)
        setMode(hasPwd ? 'verify' : 'setup')
      })
      .catch(() => toast.error("Erreur de vérification du compte"))
      .finally(() => setLoading(false))
  }, [])

  const handleVerifyOrSetup = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    if (mode === 'verify') {
      try {
        await api.post('/admin/verify-second-password', { password })
        verifySecondPassword()
      } catch (err) {
        setErrors({ password: ["Mot de passe incorrect"] })
      }
    } else if (mode === 'setup') {
      if (password !== passwordConfirmation) {
        setErrors({ password_confirmation: ["Les mots de passe ne correspondent pas"] })
        toast.error("Les mots de passe ne correspondent pas")
        setSubmitting(false)
        return
      }
      try {
        await api.post('/admin/setup-second-password', { password, password_confirmation: passwordConfirmation })
        verifySecondPassword()
        toast.success("Second mot de passe configuré avec succès")
      } catch (err) {
        const apiErrors = err.response?.data?.errors;
        if (apiErrors) setErrors(apiErrors)
        else setErrors({ general: [err.response?.data?.message || "Erreur lors de la configuration."] })
      }
    }
    setSubmitting(false)
  }

  const handleForgot = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      await api.post('/admin/forgot-second-password')
      toast.success("Code envoyé à votre adresse email.")
      setMode('reset')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'envoi de l'email.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: ["Les mots de passe ne correspondent pas"] })
      setSubmitting(false)
      return
    }

    try {
      await api.post('/admin/reset-second-password', { 
        otp, 
        password, 
        password_confirmation: passwordConfirmation 
      })
      toast.success("Second mot de passe réinitialisé !")
      // Mettre à jour l'état local et forcer la vérification
      setMode('verify')
      setPassword('')
      setPasswordConfirmation('')
      setOtp('')
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors)
      } else {
        setErrors({ general: [err.response?.data?.message || "Erreur lors de la réinitialisation."] })
      }
    } finally {
      setSubmitting(false)
    }
  }



  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'rgba(0,0,0,0.5)', 
      backdropFilter: 'blur(4px)', padding: '16px' 
    }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', background: isDark ? '#1e2130' : '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Bouton de fermeture / Déconnexion */}
        <button
          onClick={logout}
          title="Se déconnecter"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: '20px',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div style={{ marginBottom: '12px', marginTop: '8px' }}>
          <Logo dark={isDark} width="120px" />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Sécurité Administrateur
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', lineHeight: '1.4' }}>
          {loading 
            ? "Vérification de la sécurité..."
            : mode === 'setup'
              ? "Créez votre second mot de passe."
              : mode === 'reset'
                ? "Entrez le code reçu par email."
                : "Saisissez votre second mot de passe."
          }
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : (
          <form onSubmit={mode === 'reset' ? handleReset : handleVerifyOrSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {errors.general && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'left' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '6px' }}></i>
                {errors.general[0]}
              </div>
            )}
            
            {mode === 'reset' && (
              <div style={{ textAlign: 'left', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Code OTP (6 chiffres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''))
                    if (errors.otp) setErrors({ ...errors, otp: null })
                  }}
                  placeholder="000000"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '8px',
                    border: `2px solid ${errors.otp ? '#ef4444' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                    background: isDark ? '#141827' : '#f8fafc',
                    color: 'var(--text-primary)', outline: 'none', transition: 'all 0.3s',
                    textAlign: 'center', fontSize: '16px', letterSpacing: '4px', fontWeight: 'bold'
                  }}
                />
                {renderError('otp')}
              </div>
            )}

            <div style={{ textAlign: 'left', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {mode === 'reset' || mode === 'setup' ? 'Nouveau mot de passe' : 'Second mot de passe'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: null })
                  }}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '8px 28px 8px 10px', borderRadius: '8px',
                    border: `2px solid ${errors.password ? '#ef4444' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                    background: isDark ? '#141827' : '#f8fafc',
                    color: 'var(--text-primary)', outline: 'none', transition: 'all 0.3s', fontSize: '13px'
                  }}
                />
                <i 
                  className={`bi bi-eye${showPasswords ? '' : '-slash'}`} 
                  onClick={() => setShowPasswords(!showPasswords)} 
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} 
                />
              </div>
              {renderError('password')}
            </div>

            {(mode === 'setup' || mode === 'reset') && (
              <>
                <div style={{ textAlign: 'left', position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Confirmer le mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords ? "text" : "password"}
                      required
                      value={passwordConfirmation}
                      onChange={(e) => {
                        setPasswordConfirmation(e.target.value)
                        if (errors.password_confirmation) setErrors({ ...errors, password_confirmation: null })
                      }}
                      placeholder="••••••••"
                      style={{
                        width: '100%', padding: '8px 28px 8px 10px', borderRadius: '8px',
                        border: `2px solid ${errors.password_confirmation ? '#ef4444' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                        background: isDark ? '#141827' : '#f8fafc',
                        color: 'var(--text-primary)', outline: 'none', transition: 'all 0.3s', fontSize: '13px'
                      }}
                    />
                    <i 
                      className={`bi bi-eye${showPasswords ? '' : '-slash'}`} 
                      onClick={() => setShowPasswords(!showPasswords)} 
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} 
                    />
                  </div>
                  {renderError('password_confirmation')}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px', borderRadius: '8px', border: 'none',
                background: 'var(--brand-color)', color: '#fff', fontSize: '13px',
                fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: '4px', transition: 'all 0.3s', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting 
                ? 'Vérification...' 
                : (mode === 'setup' 
                    ? 'Configurer le mot de passe' 
                    : mode === 'reset'
                      ? 'Réinitialiser le mot de passe'
                      : 'Vérifier')}
            </button>
            
            {mode === 'verify' && (
              <div style={{ marginTop: '4px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleForgot}
                  disabled={submitting}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--brand-color)', fontSize: '13px',
                    fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
            
            {mode === 'reset' && (
              <div style={{ marginTop: '4px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('verify')
                    setErrors({})
                  }}
                  disabled={submitting}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', fontSize: '13px',
                    fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Retour à la vérification
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
