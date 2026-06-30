import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ServerError() {
  const { user, isAuthenticated } = useAuth()

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
        color: '#dc3545',
        lineHeight: 1,
        marginBottom: 10,
        textShadow: `0 15px 35px rgba(220, 53, 69, 0.3)`,
        letterSpacing: '-5px'
      }}>
        500
      </div>
      <h1 style={{
        fontSize: 36,
        fontWeight: 800,
        color: 'var(--text-primary)',
        marginBottom: 16,
        letterSpacing: '-1px'
      }}>
        Erreur Serveur
      </h1>
      <p style={{
        fontSize: 18,
        color: 'var(--text-muted)',
        maxWidth: 500,
        marginBottom: 40,
        lineHeight: 1.6
      }}>
        Oups ! Quelque chose s'est mal passé de notre côté. 
        Nos équipes ont été informées et travaillent à résoudre le problème. 
        Veuillez réessayer dans quelques instants.
      </p>
      
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.reload()}
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
          <i className="bi bi-arrow-clockwise" />
          Réessayer
        </button>

        <Link to={returnPath} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 28px',
          backgroundColor: '#dc3545',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 16,
          boxShadow: `0 8px 24px rgba(220, 53, 69, 0.3)`,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 12px 28px rgba(220, 53, 69, 0.4)`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(220, 53, 69, 0.3)`
        }}
        >
          <i className="bi bi-house-door-fill" />
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  )
}
