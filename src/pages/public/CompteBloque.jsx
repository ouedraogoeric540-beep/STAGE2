import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useState, useEffect } from 'react'

export default function CompteBloque() {
  const { isDark }   = useTheme()
  const navigate     = useNavigate()
  const { state }    = useLocation()

  const bloquageInfo = state || {}
  const [minutesLeft, setMinutesLeft] = useState(bloquageInfo.minutes_restantes || 120)
  const [seconds, setSeconds]         = useState(0)

  // Compte à rebours live
  useEffect(() => {
    if (minutesLeft <= 0) return
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) {
          setMinutesLeft((m) => {
            if (m <= 1) { clearInterval(interval); return 0 }
            return m - 1
          })
          return 59
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [minutesLeft])

  const bg = isDark ? '#0f172a' : '#f8fafc'
  const cardBg = isDark ? '#1e293b' : '#fff'
  const border  = isDark ? '#334155' : '#e2e8f0'

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.5s ease' }}>

        {/* Card principale */}
        <div style={{
          background: cardBg, borderRadius: 24,
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.4)'
            : '0 20px 60px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>

          {/* Header rouge */}
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '40px 32px',
            textAlign: 'center',
            position: 'relative',
          }}>
            {/* Cercle déco */}
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 120, height: 120,
              background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: -20, left: -20,
              width: 80, height: 80,
              background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
            }} />

            {/* Icône */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <i className="bi bi-shield-lock-fill" style={{ fontSize: 36, color: '#fff' }} />
            </div>

            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
              Compte temporairement bloqué
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0 }}>
              Trop de tentatives de connexion échouées détectées
            </p>
          </div>

          {/* Contenu */}
          <div style={{ padding: '32px' }}>

            {/* Explication */}
            <div style={{
              background: isDark ? '#451a1a' : '#fff5f5',
              border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
              borderLeft: '4px solid #ef4444',
              borderRadius: 12,
              padding: '16px 18px',
              marginBottom: 24,
            }}>
              <p style={{ color: isDark ? '#fca5a5' : '#b91c1c', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 8 }} />
                Votre compte a été bloqué pendant <strong>2 heures</strong> après 3 tentatives de connexion échouées.
                Un email de notification vous a été envoyé.
              </p>
            </div>

            {/* Compte à rebours */}
            <div style={{
              background: isDark ? '#0f172a' : '#f1f5f9',
              borderRadius: 16, padding: '24px',
              textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>
                Déblocage automatique dans
              </div>
              <div style={{
                fontSize: 48, fontWeight: 900,
                color: minutesLeft === 0 ? '#10b981' : '#ef4444',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 2,
              }}>
                {minutesLeft === 0 ? (
                  <span style={{ fontSize: 32 }}>✓ Débloqué !</span>
                ) : (
                  <>
                    {String(minutesLeft).padStart(2, '0')}
                    <span style={{ fontSize: 28, opacity: 0.5 }}>:</span>
                    {String(seconds).padStart(2, '0')}
                  </>
                )}
              </div>
              {minutesLeft > 0 && (
                <div style={{ fontSize: 13, color: isDark ? '#475569' : '#94a3b8', marginTop: 4 }}>
                  minutes : secondes restantes
                </div>
              )}
            </div>

            {/* Conseil */}
            <div style={{
              background: isDark ? '#172554' : '#eff6ff',
              border: `1px solid ${isDark ? '#1e3a8a' : '#bfdbfe'}`,
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 28,
            }}>
              <p style={{ color: isDark ? '#93c5fd' : '#1d4ed8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                <i className="bi bi-lightbulb-fill" style={{ marginRight: 8 }} />
                <strong>Ce n'était pas vous ?</strong> Si vous n'êtes pas à l'origine de ces tentatives, 
                modifiez votre mot de passe dès que votre compte sera débloqué.
              </p>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {minutesLeft === 0 ? (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <i className="bi bi-unlock-fill" style={{ marginRight: 8 }} />
                  Se connecter maintenant
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '14px',
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#94a3b8' : '#64748b',
                    border: `1px solid ${border}`, borderRadius: 12,
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <i className="bi bi-arrow-left" style={{ marginRight: 8 }} />
                  Retour à la connexion
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: isDark ? '#0f172a' : '#f8fafc',
            padding: '16px 32px', textAlign: 'center',
            borderTop: `1px solid ${border}`,
          }}>
            <p style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 12, margin: 0 }}>
              © {new Date().getFullYear()} <strong style={{ color: '#3b82f6' }}>SecurePass</strong>. Système de sécurité automatisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
