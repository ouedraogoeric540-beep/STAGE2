import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import LogoInline from './LogoInline'
import toast from 'react-hot-toast'

const roleLabels = {
  admin:        'Administrateur',
  organisateur: 'Organisateur',
  agent:        'Agent',
  participant:  'Participant',
}

export default function Layout({ children, title }) {
  const { isDark }       = useTheme()
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie')
    navigate('/')
  }

  const isParticipant = user?.role === 'participant'

  // Si c'est un participant, on affiche le layout horizontal (sans sidebar)
  if (isParticipant) {
    return (
      <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh' }}>
        {/* ── Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 1000,
          height: 64, padding: '0 24px',
          backgroundColor: 'var(--bg-navbar)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <LogoInline size={32} />

          {/* Desktop */}
          <div className="d-none d-md-flex" style={{ alignItems: 'center', gap: 16, display: 'flex' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-house" /> Accueil
            </Link>
            <Link to="/mes-tickets" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-ticket-perforated" /> Mes Tickets
            </Link>
            <ThemeToggle />
            <NotificationBell />

            {/* Avatar avec Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', 
                  backgroundColor: 'var(--bg-surface)', borderRadius: 10, 
                  border: `1px solid ${dropdownOpen ? 'var(--primary)' : 'var(--border)'}`, 
                  cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 10,
                  width: 220, backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                  padding: 8, zIndex: 1000, animation: 'slideUp 0.2s ease'
                }}>
                  <Link to="/parametres#profil" style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
                    color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    borderRadius: 8, transition: 'background 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <i className="bi bi-person-circle" style={{ color: 'var(--primary)', fontSize: 16 }} />
                    Mon Profil
                  </Link>
                  
                  <Link to="/parametres" style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
                    color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    borderRadius: 8, transition: 'background 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <i className="bi bi-gear" style={{ color: 'var(--primary)', fontSize: 16 }} />
                    Paramètres
                  </Link>
                  
                  <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />

                  <button onClick={handleLogout} style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', 
                    color: '#DC3545', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    borderRadius: 8, background: 'transparent', border: 'none', width: '100%', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220,53,69,0.1)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <i className="bi bi-box-arrow-right" style={{ fontSize: 16 }} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="d-md-none">
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 24, cursor: 'pointer' }}
            >
              <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} />
            </button>
          </div>
        </nav>

        {/* ── Menu mobile ── */}
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
            />

            <div style={{
              position: 'fixed', top: 64, left: 0, right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              zIndex: 999, padding: 20,
              animation: 'slideUp 0.2s ease',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {/* Infos utilisateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{roleLabels[user?.role] || 'Participant'}</div>
                </div>
              </div>

              {/* Liens */}
              {[
                { to: '/',            icon: 'bi-house',             label: 'Accueil' },
                { to: '/mes-tickets', icon: 'bi-ticket-perforated', label: 'Mes Tickets' },
                { to: '/parametres#profil', icon: 'bi-person-circle', label: 'Mon Profil' },
                { to: '/parametres#apparence',  icon: 'bi-gear',              label: 'Paramètres' },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    color: 'var(--text-primary)', textDecoration: 'none',
                    fontWeight: 600, fontSize: 14, marginBottom: 8,
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: 18, color: 'var(--primary)' }} />
                  {item.label}
                </Link>
              ))}

              {/* Déconnexion */}
              <button
                onClick={() => { setMenuOpen(false); handleLogout() }}
                style={{
                  width: '100%', padding: '12px 16px', marginTop: 8,
                  background: 'rgba(220,53,69,0.1)',
                  border: '1px solid rgba(220,53,69,0.3)',
                  borderRadius: 10, color: '#DC3545',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <i className="bi bi-box-arrow-right" style={{ fontSize: 18 }} />
                Déconnexion
              </button>
            </div>
          </>
        )}

        {/* ── Contenu ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
          {title && (
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
            </div>
          )}
          {children}
        </div>
      </div>
    )
  }

  // Pour les autres rôles (admin, organisateur, agent), on affiche le layout avec Sidebar
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="sp-main">
        <TopNavbar
          title={title}
          onBurgerClick={() => setSidebarOpen(true)}
        />
        <div style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}