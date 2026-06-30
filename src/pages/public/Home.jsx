import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../../components/common/ThemeToggle'
import Logo from '../../components/common/Logo'
import Footer from '../../components/common/Footer'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/public/EventCard'



export default function Home() {
  const { isDark } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const [evenements, setEvenements] = useState([])
  const [recherche, setRecherche]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [scrolled, setScrolled]     = useState(false)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [filterType, setFilterType] = useState('tous') // 'tous', 'gratuit', 'payant'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [recherche, filterType])

  useEffect(() => {
    setLoading(true)
    const timeoutId = setTimeout(() => {
      api.get('/evenements', { params: { search: recherche, type: filterType, page: page } })
        .then((r) => {
          // Si le backend renvoie une structure paginée (ex: r.data.data), on l'utilise.
          // Sinon (par ex: pas encore à jour), on utilise le tableau.
          if (r.data && r.data.data) {
            setEvenements(r.data.data)
            setTotalPages(r.data.last_page || 1)
            setTotalElements(r.data.total || r.data.data.length)
          } else {
            setEvenements(Array.isArray(r.data) ? r.data : [])
            setTotalPages(1)
            setTotalElements(Array.isArray(r.data) ? r.data.length : 0)
          }
        })
        .catch(() => toast.error('Erreur lors du chargement des événements.'))
        .finally(() => setLoading(false))
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [page, recherche, filterType])

  const evenementPage = evenements


  
  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login'
    if (user?.role === 'admin')        return '/admin'
    if (user?.role === 'organisateur') return '/organisateur'
    if (user?.role === 'agent')        return '/agent'
    if (user?.role === 'participant')  return '/mes-tickets'
    return '/'
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Déconnexion réussie')
    navigate('/')
  }

  return (
    <div style={{ backgroundColor: isDark ? '#0f1117' : '#f0f2f5', minHeight: '100vh' }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="home-navbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 72, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: scrolled
          ? (isDark ? 'rgba(15,17,23,0.95)' : 'rgba(255,255,255,0.95)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` : 'none',
        transition: 'all 0.3s ease',
      }}>
        <Logo size="sm" showTagline={false} />

        <div className="home-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="home-btn-dash" style={{
                background: 'var(--brand-color)',
                borderRadius: 8, color: 'var(--brand-text)',
                padding: '8px 16px',
                textDecoration: 'none', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <i className="bi bi-speedometer2" />
                <span className="d-none d-sm-inline">Dashboard</span>
              </Link>
              
              <button onClick={handleLogout} className="home-btn-logout" style={{
                background: 'rgba(220,53,69,0.15)',
                border: '1px solid rgba(220,53,69,0.3)',
                borderRadius: 8, color: '#DC3545',
                padding: '8px 16px',
                fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <i className="bi bi-box-arrow-right" />
                <span className="d-none d-sm-inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="home-btn-login" style={{
                color: 'var(--brand-color)',
                border: '1px solid var(--brand-color)',
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none', fontWeight: 600,
              }}>
                Se connecter
              </Link>
              <Link to="/register" className="home-btn-register" style={{
                background: 'var(--brand-color)',
                padding: '8px 16px',
                borderRadius: 8, color: 'var(--brand-text)',
                textDecoration: 'none', fontWeight: 600,
              }}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ── Vidéo arrière-plan ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* ── Overlay sombre sur la vidéo ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,17,23,0.85) 0%, rgba(26,29,39,0.80) 100%)'
            : 'linear-gradient(135deg, rgba(15,17,23,0.65) 0%, rgba(26,29,39,0.60) 100%)',
          zIndex: 1,
        }} />

        {/* ── Grille décorative ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(13,110,253,0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          zIndex: 2,
        }} />

        {/* ── Cercles flottants ── */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,110,253,0.15), transparent)',
          top: '10%', left: '-10%',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 2,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,62,140,0.12), transparent)',
          bottom: '15%', right: '-5%',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 2,
        }} />

        {/* ── Contenu ── */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 700, animation: 'slideUp 0.8s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(13,110,253,0.20)', border: '1px solid rgba(13,110,253,0.4)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 24,
            fontSize: 13, color: '#60a5fa', fontWeight: 600,
          }}>
            <i className="bi bi-shield-fill-check" />
            Plateforme d'achat de tickets en ligne sécurisée avec QR Code
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900, lineHeight: 1.15,
            marginBottom: 20, color: '#ffffff',
          }}>
            Achetez{' '}
            <span style={{ color: 'var(--brand-color)' }}>
              vos tickets en ligne
            </span>
            <br />avec SecurePass
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px',
          }}>
            Achetez vos tickets en ligne et accédez à vos événements en toute sécurité
            grâce à SecurePass, la plateforme de référence pour la gestion d'événements
            sécurisée avec QR Code.
          </p>

          <div className="hero-buttons-container">
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="hero-btn" style={{
                background: 'var(--brand-color)',
                borderRadius: 12, color: 'var(--brand-text)',
                textDecoration: 'none', fontWeight: 700,
                boxShadow: '0 8px 24px var(--brand-shadow)'
              }}>
                <i className="bi bi-ticket-perforated" />
                Mes tickets
              </Link>
            ) : (
              <Link to="/register" className="hero-btn" style={{
                background: 'var(--brand-color)',
                borderRadius: 12, color: 'var(--brand-text)',
                textDecoration: 'none', fontWeight: 700,
                boxShadow: '0 8px 24px var(--brand-shadow)'
              }}>
                <i className="bi bi-person-plus" />
                Inscription gratuite
              </Link>
            )}

            <a href="#evenements" className="hero-btn" style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12, color: '#fff',
                textDecoration: 'none', fontWeight: 700
            }}>
              <i className="bi bi-calendar2-event" />
              Voir les événements
            </a>
          </div>
        </div>
      </section>


      {/* ── Événements ───────────────────────────────────────── */}
      <section id="evenements" style={{
        padding: '80px 24px',
        backgroundColor: isDark ? '#1a1d27' : '#ffffff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            Événements à venir
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36, fontSize: 16 }}>
            Découvrez les événements disponibles et réservez votre place
          </p>

          {/* Recherche + Filtres */}
          <div style={{ maxWidth: 600, margin: '0 auto 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <i className="bi bi-search" style={{
                position: 'absolute', left: 16, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16,
              }} />
              <input
                type="text" value={recherche}
                onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
                placeholder="Rechercher un événement ou un lieu…"
                style={{
                  width: '100%', padding: '14px 16px 14px 44px',
                  backgroundColor: isDark ? '#252839' : '#f7fafc',
                  border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                  borderRadius: 16, color: 'var(--text-primary)',
                  fontSize: 15, outline: 'none', transition: 'all 0.2s',
                  boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0D6EFD'; e.target.style.boxShadow = '0 4px 12px rgba(13,110,253,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0'; e.target.style.boxShadow = isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'; }}
              />
            </div>

            {/* Quick Filters */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { id: 'tous', label: 'Tous', icon: 'bi-grid-fill' },
                { id: 'gratuit', label: 'Gratuits', icon: 'bi-gift-fill' },
                { id: 'payant', label: 'Payants', icon: 'bi-ticket-detailed-fill' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilterType(f.id); setPage(1); }}
                  style={{
                    padding: '8px 18px', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${filterType === f.id ? '#0D6EFD' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                    backgroundColor: filterType === f.id ? 'var(--brand-color)' : (isDark ? '#1e2130' : '#ffffff'),
                    color: filterType === f.id ? 'var(--brand-text)' : 'var(--text-primary)',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: filterType === f.id ? '0 4px 12px rgba(13,110,253,0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => { if(filterType !== f.id) e.currentTarget.style.backgroundColor = isDark ? '#252839' : '#f8f9fa' }}
                  onMouseLeave={(e) => { if(filterType !== f.id) e.currentTarget.style.backgroundColor = isDark ? '#1e2130' : '#ffffff' }}
                >
                  <i className={`bi ${f.icon}`} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compteur résultats */}
          {!loading && totalElements > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ color: '#0D6EFD', fontWeight: 700 }}>{totalElements}</span> événement(s) trouvé(s)
              {totalPages > 1 && (
                <span> — Page <span style={{ color: '#0D6EFD', fontWeight: 700 }}>{page}</span> sur <span style={{ fontWeight: 700 }}>{totalPages}</span></span>
              )}
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{
                width: 40, height: 40, border: '3px solid var(--border)',
                borderTopColor: '#0D6EFD', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
              }} />
              Chargement des événements…
            </div>
          ) : evenements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <i className="bi bi-calendar-x" style={{ fontSize: 48, display: 'block', marginBottom: 16 }} />
              Aucun événement disponible pour le moment.
            </div>
          ) : (
            <>
              <div className="event-grid">
                {evenementPage.map((ev, i) => (
                  <EventCard key={ev.id} ev={ev} isDark={isDark} i={i} />
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>

                  {/* Précédent */}
                  <button
                    onClick={() => { setPage(page - 1); document.getElementById('evenements').scrollIntoView({ behavior: 'smooth' }) }}
                    disabled={page === 1}
                    style={{
                      padding: '10px 16px',
                      background: page === 1 ? (isDark ? '#1e2130' : '#f0f2f5') : 'var(--brand-color)',
                      border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                      borderRadius: 10, color: page === 1 ? 'var(--text-muted)' : 'var(--brand-text)',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 6,
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    <i className="bi bi-chevron-left" /> Précédent
                  </button>

                  {/* Numéros de pages */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      // Afficher seulement les pages proches de la page courante
                      if (
                        p === 1 || p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => { setPage(p); document.getElementById('evenements').scrollIntoView({ behavior: 'smooth' }) }}
                            style={{
                              width: 40, height: 40, borderRadius: 10,
                              cursor: 'pointer',
                              fontWeight: 700, fontSize: 14,
                              background: p === page
                                ? 'var(--brand-color)'
                                : (isDark ? '#1e2130' : '#f0f2f5'),
                              color: p === page ? 'var(--brand-text)' : 'var(--text-primary)',
                              border: `1px solid ${p === page ? 'transparent' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {p}
                          </button>
                        )
                      }

                      // Points de suspension
                      if (p === page - 2 || p === page + 2) {
                        return (
                          <span key={p} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 16 }}>
                            …
                          </span>
                        )
                      }

                      return null
                    })}
                  </div>

                  {/* Suivant */}
                  <button
                    onClick={() => { setPage(page + 1); document.getElementById('evenements').scrollIntoView({ behavior: 'smooth' }) }}
                    disabled={page === totalPages}
                    style={{
                      padding: '10px 16px',
                      background: page === totalPages ? (isDark ? '#1e2130' : '#f0f2f5') : 'var(--brand-color)',
                      border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                      borderRadius: 10, color: page === totalPages ? 'var(--text-muted)' : 'var(--brand-text)',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 6,
                      opacity: page === totalPages ? 0.5 : 1,
                    }}
                  >
                    Suivant <i className="bi bi-chevron-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'var(--brand-color)',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--brand-text)', marginBottom: 12 }}>
          Vous organisez des événements ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 36 }}>
          Contactez un administrateur SecurePass pour créer votre compte organisateur
        </p>
        
         <a href="https://wa.me/22606248959"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 40px',
            background: '#fff', borderRadius: 12,
            color: '#25D366', textDecoration: 'none',
            fontWeight: 700, fontSize: 16,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <i className="bi bi-whatsapp" />
          Nous contacter sur WhatsApp
        </a>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}