import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../../components/common/Logo'
import ThemeToggle from '../../components/common/ThemeToggle'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
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

  const getError = (field) => errors[field] ? errors[field][0] : null

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
      if (data?.compte_bloque) {
        navigate('/compte-bloque', {
          state: {
            minutes_restantes: data.minutes_restantes ?? 120,
            bloque_jusqu_a: data.bloque_jusqu_a,
          }
        })
        return
      }
      if (data?.tentatives_restantes !== undefined) {
        toast.error(`Identifiants incorrects. Il vous reste ${data.tentatives_restantes} tentative(s).`)
      } else {
        toast.error(data?.message || 'Identifiants incorrects.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
    }}>
      {/* Formes géométriques d'arrière-plan */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw',
        background: 'var(--brand-glow)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.6, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw',
        background: 'var(--brand-glow)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.6, pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
          
          <div style={{ position: 'absolute', top: 24, right: 24 }}>
            <ThemeToggle />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Logo size="md" showTagline />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
            Bon retour !
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
            Connectez-vous pour accéder à votre espace SecurePass
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <Input
              label="Identifiant ou Email"
              name="login"
              type="text"
              icon="bi-person"
              placeholder="vous@exemple.com"
              value={form.login}
              onChange={handle}
              error={getError('login')}
              required
            />

            <div style={{ position: 'relative' }}>
              <Input
                label="Mot de passe"
                name="password"
                type={showPwd ? 'text' : 'password'}
                icon="bi-lock"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                error={getError('password')}
                required
                style={{ paddingRight: '46px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '12px', top: getError('password') ? '38px' : '44px',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                label="Se souvenir de moi"
              />
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--brand-color)', textDecoration: 'none', fontWeight: 600, transition: 'var(--transition-fast)' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon="bi-box-arrow-in-right"
              style={{ marginTop: '8px', padding: '14px', fontSize: '15px' }}
            >
              Se connecter
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--brand-color)', fontWeight: 700, textDecoration: 'none' }}>
              Créer un compte
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="bi bi-arrow-left" /> Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}