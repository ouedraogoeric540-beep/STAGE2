import { useAuth } from '../../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Avatar from '../ui/Avatar'
import toast from 'react-hot-toast'

const roleColors = {
  admin: '#ef4444',
  organisateur: '#3b82f6',
  agent: '#10b981',
}

export default function TopNavbar({ title, onBurgerClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Supprimé goToProfile et goToSettings car on utilise <Link> maintenant

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Déconnexion réussie')
    setOpen(false)
  }

  return (
    <div className="sp-navbar">
      <button
        onClick={onBurgerClick}
        className="d-md-none btn btn-sm"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          width: 42, height: 42,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, flexShrink: 0,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
      >
        <i className="bi bi-list" style={{ fontSize: 24 }} />
      </button>

      {/* Espace flexible pour pousser les actions à droite */}
      <div style={{ flex: 1 }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <ThemeToggle />

        <NotificationBell />

        {/* Avatar avec dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px',
              backgroundColor: 'var(--bg-surface)', borderRadius: 10,
              border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
            }}
          >
            <Avatar name={user?.name} size="sm" color={roleColors[user?.role] || '#3b82f6'} />
            <div className="d-none d-md-flex" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }} />
          </button>

          {open && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 10,
              width: 220,
              borderRadius: 'var(--radius-lg)',
              padding: 8, zIndex: 1000, animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <Link
                to="/parametres#profil"
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  textAlign: 'left', cursor: 'pointer', textDecoration: 'none',
                  color: 'var(--text-primary)', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="bi bi-person-circle" style={{ color: 'var(--primary)', fontSize: 16 }} /> Profil
              </Link>
              <Link
                to="/parametres#apparence"
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  textAlign: 'left', cursor: 'pointer', textDecoration: 'none',
                  color: 'var(--text-primary)', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="bi bi-gear" style={{ color: 'var(--primary)', fontSize: 16 }} /> Paramètres
              </Link>

              <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'transparent', border: 'none',
                  textAlign: 'left', cursor: 'pointer',
                  color: '#DC3545', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220,53,69,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="bi bi-box-arrow-right" style={{ fontSize: 16 }} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
