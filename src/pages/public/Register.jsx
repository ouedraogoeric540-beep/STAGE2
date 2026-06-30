import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import CustomSelect from '../../components/common/CustomSelect'
import Logo from '../../components/common/Logo'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'

export default function Register() {
  const { isDark }   = useTheme()
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    name: '', prenom: '', sexe: '', email: '', telephone: '',
    password: '', password_confirmation: '',
  })
  const [showPwd, setShowPwd]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
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
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]))
      else toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
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

        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 2 }}>
          Créer mon compte
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
          Inscrivez-vous pour accéder à vos tickets
        </p>

        <form onSubmit={submit}>
          {/* Row 1: Nom & Prénom */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Nom *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" value={form.name} onChange={handle} required
                  placeholder="Votre nom"
                  style={{ ...inputStyle, paddingLeft: 36 }} />
              </div>
            </div>

            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Prénom</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="prenom" value={form.prenom} onChange={handle}
                  placeholder="Votre prénom"
                  style={{ ...inputStyle, paddingLeft: 36 }} />
              </div>
            </div>
          </div>

          {/* Row 2: Sexe & Téléphone */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Sexe</label>
              <div style={{ position: 'relative' }}>
                <CustomSelect 
                  value={form.sexe}
                  onChange={(val) => handle({ target: { name: 'sexe', value: val } })}
                  placeholder="Sélectionner"
                  options={[
                    { value: 'M', label: 'Homme' },
                    { value: 'F', label: 'Femme' }
                  ]}
                />
              </div>
            </div>

            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Téléphone</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-telephone" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" name="telephone" value={form.telephone} onChange={handle}
                  placeholder="+226 00 00 00 00"
                  style={{ ...inputStyle, paddingLeft: 36 }} />
              </div>
            </div>
          </div>

          {/* Email (Full width) */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Adresse email *</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" name="email" value={form.email} onChange={handle} required
                placeholder="vous@exemple.com"
                style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
          </div>

          {/* Row 3: Mots de passe */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle} required
                  placeholder="Min. 8 car."
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <div style={{ flex: '1 1 calc(50% - 6px)', minWidth: 150 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Confirmer *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type={showConf ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handle} required
                  placeholder="Confirmer"
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }} />
                <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`bi ${showConf ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-brand w-100" style={{
            padding: '13px',
            borderRadius: 10,
            fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading ? (
              <>
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Création…
              </>
            ) : (
              <><i className="bi bi-person-plus" /> Créer mon compte</>
            )}
          </button>
        </form>

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