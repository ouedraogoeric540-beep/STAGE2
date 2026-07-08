import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
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
    password: '', password_confirmation: '', accepte_cgu: false,
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('participant')
  const [errors, setErrors] = useState({})

  const handle = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }
  
  const getError = (field) => errors[field] ? errors[field][0] : null;

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
        else toast.error(err.response?.data?.message || "Erreur lors de l'inscription.")
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        const res = await api.post('/register-organisateur', { name: form.name, email: form.email, accepte_cgu: form.accepte_cgu })
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
        else toast.error(err.response?.data?.message || "Erreur lors de l'inscription.")
      } finally {
        setLoading(false)
      }
    }
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
        position: 'absolute', top: '-10%', right: '-5%', width: '50vw', height: '50vw',
        background: 'var(--brand-glow)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.6, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw',
        background: 'var(--brand-glow)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.6, pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 500,
        zIndex: 10,
        animation: 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ position: 'absolute', top: 24, right: 24 }}>
            <ThemeToggle />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Logo size="sm" showTagline />
          </div>

          {!organisateurSuccess ? (
            <>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                Créer mon compte
              </h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Inscrivez-vous pour accéder à vos tickets ou gérer vos événements
              </p>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                <button 
                  type="button"
                  onClick={() => setActiveTab('participant')}
                  style={{ 
                    flex: 1, padding: '12px', background: 'none', border: 'none', 
                    borderBottom: activeTab === 'participant' ? '2px solid var(--brand-color)' : '2px solid transparent', 
                    color: activeTab === 'participant' ? 'var(--brand-color)' : 'var(--text-muted)', 
                    fontWeight: activeTab === 'participant' ? 700 : 500, cursor: 'pointer', transition: 'var(--transition-fast)' 
                  }}
                >
                  Participant
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('organisateur')}
                  style={{ 
                    flex: 1, padding: '12px', background: 'none', border: 'none', 
                    borderBottom: activeTab === 'organisateur' ? '2px solid var(--brand-color)' : '2px solid transparent', 
                    color: activeTab === 'organisateur' ? 'var(--brand-color)' : 'var(--text-muted)', 
                    fontWeight: activeTab === 'organisateur' ? 700 : 500, cursor: 'pointer', transition: 'var(--transition-fast)' 
                  }}
                >
                  Organisateur
                </button>
              </div>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Input
                    label="Nom *"
                    name="name"
                    type="text"
                    icon="bi-person"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={handle}
                    error={getError('name')}
                    required
                    containerStyle={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}
                  />
                  <Input
                    label="Prénom"
                    name="prenom"
                    type="text"
                    icon="bi-person"
                    placeholder="Votre prénom"
                    value={form.prenom}
                    onChange={handle}
                    error={getError('prenom')}
                    containerStyle={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}
                  />
                </div>

                {activeTab === 'participant' && (
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Select
                      label="Sexe"
                      name="sexe"
                      icon="bi-gender-ambiguous"
                      value={form.sexe}
                      onChange={(e) => {
                        setForm({ ...form, sexe: e.target.value })
                        if (errors.sexe) setErrors({ ...errors, sexe: null })
                      }}
                      options={[
                        { value: '', label: 'Sélectionner...' },
                        { value: 'M', label: 'Homme' },
                        { value: 'F', label: 'Femme' }
                      ]}
                      error={getError('sexe')}
                      containerStyle={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}
                    />
                    <Input
                      label="Téléphone"
                      name="telephone"
                      type="tel"
                      icon="bi-telephone"
                      placeholder="+226 00 00 00 00"
                      value={form.telephone}
                      onChange={handle}
                      error={getError('telephone')}
                      containerStyle={{ flex: '1 1 calc(50% - 8px)', minWidth: 150 }}
                    />
                  </div>
                )}

                <Input
                  label="Adresse email *"
                  name="email"
                  type="email"
                  icon="bi-envelope"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={handle}
                  error={getError('email')}
                  required
                />

                {activeTab === 'organisateur' && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-8px' }}>
                    <i className="bi bi-info-circle me-1" /> Vous recevrez vos accès de connexion par email.
                  </p>
                )}

                {activeTab === 'participant' && (
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
                      <Input
                        label="Mot de passe *"
                        name="password"
                        type={showPwd ? 'text' : 'password'}
                        icon="bi-lock"
                        placeholder="Min. 8 car."
                        value={form.password}
                        onChange={handle}
                        error={getError('password')}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: getError('password') ? '38px' : '44px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                      </button>
                    </div>

                    <div style={{ position: 'relative', flex: '1 1 calc(50% - 8px)', minWidth: 150 }}>
                      <Input
                        label="Confirmer *"
                        name="password_confirmation"
                        type={showConf ? 'text' : 'password'}
                        icon="bi-lock-fill"
                        placeholder="Confirmer"
                        value={form.password_confirmation}
                        onChange={handle}
                        error={getError('password_confirmation')}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                      <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: '12px', top: getError('password_confirmation') ? '38px' : '44px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        <i className={`bi ${showConf ? 'bi-eye-slash' : 'bi-eye'}`} />
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '8px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <Checkbox
                    checked={form.accepte_cgu}
                    onChange={(e) => {
                      setForm({ ...form, accepte_cgu: e.target.checked })
                      if (errors.accepte_cgu) setErrors({ ...errors, accepte_cgu: null })
                    }}
                    label={
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        J'ai lu et j'accepte les <Link to="/conditions" target="_blank" style={{ color: 'var(--brand-color)', fontWeight: 600, textDecoration: 'none' }}>Conditions Générales d'Utilisation</Link> et la <Link to="/confidentialite" target="_blank" style={{ color: 'var(--brand-color)', fontWeight: 600, textDecoration: 'none' }}>Politique de Confidentialité</Link>.
                      </span>
                    }
                  />
                  {getError('accepte_cgu') && <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', marginLeft: '30px' }}>{getError('accepte_cgu')}</div>}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!form.accepte_cgu}
                  icon="bi-person-plus"
                  style={{ marginTop: '8px', padding: '14px', fontSize: '15px' }}
                >
                  {activeTab === 'participant' ? "S'inscrire" : "Créer mon compte organisateur"}
                </Button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
                <i className="bi bi-check-lg" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Compte créé !</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Voici vos accès temporaires. Veuillez les conserver précieusement.</p>
              
              <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '32px', textAlign: 'left', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Identifiant de connexion</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{organisateurSuccess.identifiant}</span>
                    <button onClick={() => { navigator.clipboard.writeText(organisateurSuccess.identifiant); toast.success('Copié !') }} style={{ background: 'none', border: 'none', color: 'var(--brand-color)', cursor: 'pointer' }}><i className="bi bi-copy" /></button>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Mot de passe temporaire</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{organisateurSuccess.temp_password}</span>
                    <button onClick={() => { navigator.clipboard.writeText(organisateurSuccess.temp_password); toast.success('Copié !') }} style={{ background: 'none', border: 'none', color: 'var(--brand-color)', cursor: 'pointer' }}><i className="bi bi-copy" /></button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={async () => {
                  try {
                    await login(organisateurSuccess.identifiant, organisateurSuccess.temp_password)
                    navigate('/organisateur')
                  } catch {
                    toast.error("Erreur de connexion auto.")
                  }
                }} 
                variant="primary"
                fullWidth
                style={{ padding: '14px', fontSize: '15px' }}
                iconPosition="right"
                icon="bi-arrow-right"
              >
                Continuer vers mon espace
              </Button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--brand-color)', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
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