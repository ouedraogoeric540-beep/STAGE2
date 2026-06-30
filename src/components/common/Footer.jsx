import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import Logo from './Logo'

export default function Footer() {
  const { isDark } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <>
      <style>{`
        .footer-link {
          color: #9aa0b4;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
          display: inline-block;
          padding: 4px 0;
        }
        .footer-link:hover {
          color: #fff;
          transform: translateX(4px);
        }
        .footer-social {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          color: #9aa0b4; text-decoration: none;
          transition: all 0.2s;
        }
        .footer-social:hover {
          background: var(--brand-color, #0D6EFD);
          color: #fff;
          transform: translateY(-3px);
        }
      `}</style>
      <footer style={{
        backgroundColor: isDark ? '#0b0d14' : '#141720',
        padding: '60px 24px 24px', 
        color: '#9aa0b4',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <Logo size="sm" showTagline />
              <p style={{ fontSize: 13, marginTop: 16, lineHeight: 1.6, maxWidth: 280 }}>
                La plateforme de référence pour la gestion d'événements sécurisée avec génération de Pass Digital et contrôle QR Code.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 15, letterSpacing: '0.5px' }}>Navigation</h4>
              
              <div style={{ marginBottom: 8 }}>
                <Link to="/" className="footer-link">Accueil</Link>
              </div>
              
              {isAuthenticated ? (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Link to={`/${user?.role}/dashboard`} className="footer-link">Tableau de bord</Link>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <button onClick={logout} className="footer-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>Déconnexion</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Link to="/login" className="footer-link">Connexion</Link>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Link to="/register" className="footer-link">Inscription</Link>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 15, letterSpacing: '0.5px' }}>Suivez-nous</h4>
              <div style={{ display: 'flex', gap: 12 }}>
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((s) => (
                  <a key={s} href="#" className="footer-social">
                    <i className={`bi bi-${s}`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.08)', 
            paddingTop: 24, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 13 
          }}>
            <div>© {new Date().getFullYear()} SecurePass. Tous droits réservés.</div>
            <div style={{ display: 'flex', gap: 24 }}>
               <a href="#" className="footer-link" style={{ fontSize: 12 }}>Conditions</a>
               <a href="#" className="footer-link" style={{ fontSize: 12 }}>Confidentialité</a>
               <a href="#" className="footer-link" style={{ fontSize: 12 }}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
