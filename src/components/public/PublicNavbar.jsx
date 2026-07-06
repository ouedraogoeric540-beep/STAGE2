import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import Logo from '../common/Logo'
import toast from 'react-hot-toast'

/**
 * PublicNavbar — Barre de navigation publique partagée
 * Props:
 *   transparent  (bool)  — true = fond transparent par défaut (pour Landing Page hero)
 *                          false = fond solide dès le départ (pour pages intérieures)
 */
export default function PublicNavbar({ transparent = false }) {
  const { isDark } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie')
    setMobileOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login'
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'organisateur') return '/organisateur'
    if (user?.role === 'agent') return '/agent'
    if (user?.role === 'participant') return '/mes-tickets'
    return '/'
  }

  // Determine colors based on transparent mode + scroll state
  const showSolid = !transparent || scrolled
  const textColor = showSolid ? (isDark ? '#e2e8f0' : '#334155') : '#fff'
  const brandColor = 'var(--brand-color, #5C32FF)'

  return (
    <>
      <style>{`
        .pub-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          height: 80px; padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.35s ease;
          background-color: ${showSolid
            ? (isDark ? 'rgba(15,17,23,0.95)' : 'rgba(255,255,255,0.95)')
            : 'transparent'};
          backdrop-filter: ${showSolid ? 'blur(12px)' : 'none'};
          border-bottom: ${showSolid ? `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` : 'none'};
        }
        .pub-nav-inner {
          max-width: 1400px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pub-navlink {
          color: ${textColor}; text-decoration: none; font-size: 14px;
          font-weight: 600; padding: 8px 14px; border-radius: 8px;
          transition: all 0.2s; white-space: nowrap;
        }
        .pub-navlink:hover { background: rgba(92,50,255,0.1); color: ${brandColor}; }

        .pub-btn-outline {
          border: 1.5px solid ${showSolid ? brandColor : 'rgba(255,255,255,0.4)'};
          color: ${showSolid ? brandColor : '#fff'};
          background: transparent; padding: 8px 18px; border-radius: 8px;
          font-weight: 700; font-size: 14px; text-decoration: none;
          transition: all 0.2s; white-space: nowrap; cursor: pointer;
        }
        .pub-btn-outline:hover { background: ${brandColor}; color: #fff; border-color: ${brandColor}; }

        .pub-btn-fill {
          background: ${brandColor}; color: #fff; padding: 8px 18px;
          border-radius: 8px; font-weight: 700; font-size: 14px;
          text-decoration: none; border: none; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .pub-btn-fill:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(92,50,255,0.3); }

        .pub-btn-logout {
          background: rgba(220,53,69,0.15); border: 1px solid rgba(220,53,69,0.3);
          border-radius: 8px; color: #DC3545; padding: 8px 16px;
          font-weight: 600; cursor: pointer; font-size: 14px;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s; font-family: inherit;
        }
        .pub-btn-logout:hover { background: rgba(220,53,69,0.25); }

        /* Mobile toggle */
        .pub-mobile-toggle {
          display: none; background: none; border: none;
          color: ${textColor}; font-size: 24px; cursor: pointer; padding: 4px;
        }

        /* Desktop nav links & actions */
        .pub-nav-menu { display: flex; align-items: center; justify-content: space-between; flex: 1; margin-left: 32px; }
        .pub-nav-links { display: flex; align-items: center; gap: 4px; }
        .pub-nav-actions { display: flex; align-items: center; gap: 10px; }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .pub-mobile-toggle { display: block; }
          .pub-nav-menu { display: none; }
          .pub-nav-menu.open {
            display: flex; flex-direction: column; position: absolute;
            top: 80px; left: 0; right: 0; padding: 16px 24px 24px; gap: 16px;
            background: ${isDark ? 'rgba(11,13,20,0.98)' : 'rgba(255,255,255,0.98)'};
            backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border-bottom: 1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'};
            margin: 0; align-items: flex-start;
          }
          .pub-nav-menu.open .pub-nav-links {
            display: flex; flex-direction: column; width: 100%; gap: 0; align-items: flex-start;
          }
          .pub-nav-menu.open .pub-navlink {
            width: 100%; padding: 12px 0; color: ${isDark ? '#e2e8f0' : '#334155'};
            border-bottom: 1px solid ${isDark ? '#1e293b' : '#f1f5f9'};
          }
          .pub-nav-menu.open .pub-nav-actions {
            display: flex; flex-direction: column; width: 100%; gap: 10px; align-items: stretch;
          }
          .pub-nav-menu.open .pub-btn-outline, .pub-nav-menu.open .pub-btn-fill, .pub-nav-menu.open .pub-btn-logout {
            width: 100%; justify-content: center; text-align: center;
          }
          .pub-nav-menu.open .pub-btn-outline {
            color: ${brandColor};
            border-color: ${brandColor};
          }
          .pub-nav-menu.open .d-none.d-sm-inline { display: inline !important; }
        }
      `}</style>

      <nav className={`pub-nav${mobileOpen ? ' open' : ''}`}>
        <div className="pub-nav-inner">
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Logo size="sm" showTagline={false} />
          </Link>

          <div className={`pub-nav-menu ${mobileOpen ? 'open' : ''}`}>
            <div className="pub-nav-links">
              <Link to="/" className="pub-navlink" onClick={() => setMobileOpen(false)}>Accueil</Link>
              <Link to="/evenements" className="pub-navlink" onClick={() => setMobileOpen(false)}>Événements</Link>
              <a href="/#fonctionnalites" className="pub-navlink" onClick={() => setMobileOpen(false)}>À propos</a>
              <a href="/#contact" className="pub-navlink" onClick={() => setMobileOpen(false)}>Contact</a>
            </div>

            <div className="pub-nav-actions">
              <div className="d-none d-lg-block">
                <ThemeToggle />
              </div>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="pub-btn-fill" onClick={() => setMobileOpen(false)}>
                    <i className="bi bi-speedometer2"></i>
                    <span className="d-none d-sm-inline">Dashboard</span>
                  </Link>
                  <button onClick={handleLogout} className="pub-btn-logout">
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="d-none d-sm-inline">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="pub-btn-outline" onClick={() => setMobileOpen(false)}>Se connecter</Link>
                  <Link to="/register" className="pub-btn-fill" onClick={() => setMobileOpen(false)}>Créer un compte</Link>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="d-lg-none">
              <ThemeToggle />
            </div>
            <button className="pub-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
