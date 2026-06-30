import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
export default function NotFound() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const getReturnPath = () => {
    if (!isAuthenticated || !user) return '/'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'organisateur': return '/organisateur'
      case 'agent': return '/agent'
      case 'participant': return '/participant/tickets'
      default: return '/'
    }
  }

  const returnPath = getReturnPath()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-body)',
      padding: 20,
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        fontSize: 140,
        fontWeight: 900,
        color: 'var(--primary)',
        lineHeight: 1,
        marginBottom: 10,
        textShadow: `0 15px 35px var(--primary-glow)`,
        letterSpacing: '-5px'
      }}>
        404
      </div>
      <h1 style={{
        fontSize: 36,
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 16,
        letterSpacing: '-1px'
      }}>
        Page introuvable
      </h1>
      <p style={{
        fontSize: 18,
        color: 'var(--text-muted)',
        maxWidth: 450,
        marginBottom: 40,
        lineHeight: 1.6
      }}>
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
        Vérifiez l'URL ou retournez à votre espace.
      </p>
      
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 28px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          <i className="bi bi-arrow-left" />
          Page précédente
        </button>

        <Link to={returnPath} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 28px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: `0 8px 24px var(--primary-glow)`,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 12px 28px var(--primary-glow)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = `0 8px 24px var(--primary-glow)`
        }}
        >
          <i className={isAuthenticated ? "bi bi-grid-1x2-fill" : "bi bi-house-door-fill"} />
          {isAuthenticated ? "Mon Tableau de bord" : "Retour à l'accueil"}
        </Link>
      </div>
    </div>
  )
}
