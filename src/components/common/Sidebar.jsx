import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LogoInline from './LogoInline'
import toast from 'react-hot-toast'

const navByRole = {
  admin: [
    { to: '/admin',            icon: 'bi-grid-1x2-fill',    label: 'Vue d\'ensemble' },
    { to: '/admin/contacts',   icon: 'bi-envelope',         label: 'Messages Contact' },
    { 
      icon: 'bi-people-fill', label: 'Utilisateurs',
      subItems: [
        { to: '/admin/users?role=admin',        label: 'Administrateurs' },
        { to: '/admin/users?role=organisateur', label: 'Organisateurs' },
        { to: '/admin/users?role=agent',        label: 'Agents' },
        { to: '/admin/users?role=participant',  label: 'Participants' },
      ]
    },
    { 
      icon: 'bi-calendar-event', label: 'Événements',
      subItems: [
        { to: '/admin/evenements',        label: 'Tous les événements' },
        { to: '/admin/evenements-actifs', label: 'Événements Actifs' },
        { to: '/admin/evenements?status=en_attente', label: 'En attente' },
      ]
    },
    { to: '/admin/mes-tickets', icon: 'bi-ticket-perforated', label: 'Mes Tickets' },
    { to: '/admin/logs',       icon: 'bi-terminal-fill',     label: 'Logs Système'   },
  ],
  organisateur: [
    { to: '/organisateur',            icon: 'bi-grid-1x2-fill',  label: 'Vue d\'ensemble' },
    { 
      icon: 'bi-calendar-event', label: 'Événements',
      subItems: [
        { to: '/organisateur/evenements',        label: 'Mes Événements' },
        { to: '/organisateur/evenements-actifs', label: 'Événements Actifs' },
        { to: '/organisateur/evenements?status=en_attente', label: 'En attente' },
      ]
    },
    { to: '/organisateur/scans', icon: 'bi-qr-code-scan', label: 'Suivi des Scans' },
    { to: '/organisateur/agents',     icon: 'bi-person-badge',    label: 'Mes Agents'      },
    { to: '/organisateur/mes-tickets', icon: 'bi-ticket-perforated', label: 'Mes Tickets' },
  ],
  agent: [
    { to: '/agent',         icon: 'bi-grid-1x2-fill', label: 'Vue d\'ensemble' },
    { to: '/agent/evenements', icon: 'bi-calendar-event', label: 'Événements Affectés' },
    { to: '/agent/scanner', icon: 'bi-qr-code-scan',  label: 'Terminal Scanner' },
    { to: '/agent/historique', icon: 'bi-clock-history', label: 'Historique Complet' },
    { to: '/agent/mes-tickets', icon: 'bi-ticket-perforated', label: 'Mes Tickets' },
  ],
}

const roleConfig = {
  admin:        { color: '#ef4444', label: 'Administrateur', icon: 'bi-shield-check'     },
  organisateur: { color: '#3b82f6', label: 'Organisateur',   icon: 'bi-person-workspace' },
  agent:        { color: '#10b981', label: 'Agent',          icon: 'bi-person-badge'     },
}

import { useState, useEffect } from 'react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const navItems         = navByRole[user?.role] || []
  const role             = roleConfig[user?.role] || roleConfig.admin
  const [openMenu, setOpenMenu] = useState('')

  // Ouvrir le menu si on est sur une sous-page correspondante
  useEffect(() => {
    if (location.pathname.includes('/users')) {
      setOpenMenu('Utilisateurs')
    } else if (location.pathname.includes('/evenements')) {
      setOpenMenu('Événements')
    }
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie')
    navigate('/')
    onClose()
  }

  const toggleMenu = (label) => {
    setOpenMenu(prev => prev === label ? '' : label)
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      <aside className={`sp-sidebar ${isOpen ? 'open' : ''}`}>

        {/* Logo + Fermer */}
        <div style={{
          padding: '0 16px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <LogoInline size={34} />
          <button
            onClick={onClose}
            className="d-md-none btn btn-sm"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)', border: 'none',
              borderRadius: 8, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <i className="bi bi-x-lg" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 2,
            padding: '0 8px 10px',
          }}>
            Navigation
          </div>

          {navItems.map((item) => (
            item.subItems ? (
              <div key={item.label}>
                <div
                  onClick={() => toggleMenu(item.label)}
                  className="sidebar-link"
                  style={{ cursor: 'pointer', justifyContent: 'space-between', marginBottom: openMenu === item.label ? 4 : undefined }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <i className={`bi ${item.icon}`} />
                    <span>{item.label}</span>
                  </div>
                  <i className={`bi bi-chevron-${openMenu === item.label ? 'up' : 'down'}`} style={{ fontSize: 12, marginRight: 0, width: 'auto', background: 'transparent' }} />
                </div>
                {openMenu === item.label && (
                  <div className="nav flex-column" style={{ 
                    paddingLeft: '1rem',
                    marginLeft: '22px',
                    borderLeft: '1px solid var(--border)',
                    marginBottom: '12px',
                    animation: 'fadeIn 0.2s ease' 
                  }}>
                    {item.subItems.map(sub => {
                      const isActive = location.pathname + location.search === sub.to
                      return (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          onClick={onClose}
                          className={`nav-link d-flex align-items-center gap-2 py-1 px-2 mb-1 rounded ${isActive ? 'active' : ''}`}
                          style={{
                            color: isActive ? 'var(--brand-color)' : 'var(--text-secondary)',
                            fontSize: '13px',
                            fontWeight: isActive ? 700 : 500,
                            background: isActive ? 'var(--brand-glow)' : 'transparent',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => { 
                            if (!isActive) { 
                              e.currentTarget.style.color = 'var(--text-primary)';
                              e.currentTarget.style.background = 'var(--bg-surface)';
                            } 
                          }}
                          onMouseLeave={(e) => { 
                            if (!isActive) { 
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.background = 'transparent';
                            } 
                          }}
                        >
                          <i className={`bi ${isActive ? 'bi-record-circle-fill' : 'bi-record-circle'}`} style={{ fontSize: '10px', background: 'transparent', width: 'auto', height: 'auto' }} />
                          {sub.label}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavLink
            to="/parametres#apparence"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{ marginBottom: 4 }}
          >
            <i className="bi bi-gear-fill" />
            <span>Paramètres</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100"
            style={{ fontSize: 13, padding: '9px', borderRadius: 10 }}
          >
            <i className="bi bi-box-arrow-left me-2" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}