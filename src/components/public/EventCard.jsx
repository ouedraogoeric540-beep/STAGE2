import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../../api/axios'

export default function EventCard({ ev, isDark, i }) {
  const navigate = useNavigate()

  const isIllimite = ev.categories?.some(c => c.quantite_total == -1)
  const placesRestantes = isIllimite ? 999999 : (ev.categories?.reduce((sum, c) => sum + (c.quantite_total - c.quantite_vendue), 0) ?? 0)
  const prixMin = ev.categories?.length
    ? Math.min(...ev.categories.map((c) => c.prix))
    : 0

  return (
    <div className="event-card" style={{
      width: '100%', margin: '0 auto', // Empêche la carte de devenir immense sur mobile
      backgroundColor: isDark ? '#191c28' : '#ffffff',
      border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
      borderRadius: 16, overflow: 'hidden',
      animation: `fadeIn 0.5s ease ${i * 0.08}s both`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
      onClick={() => navigate(`/evenements/${ev.id}`)}
    >
      {/* Image */}
      <div className="event-card-img" style={{
        height: 180, width: '100%',
        background: ev.image
          ? `url(${getImageUrl(ev.image)}) center/cover`
          : 'linear-gradient(135deg, #0D6EFD22, #E83E8C22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {!ev.image && <i className="bi bi-calendar-event" style={{ fontSize: 48, color: '#0D6EFD', opacity: 0.5 }} />}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: (isIllimite || placesRestantes > 0) ? '#19875422' : '#DC354522',
          border: `1px solid ${(isIllimite || placesRestantes > 0) ? '#198754' : '#DC3545'}`,
          borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
          color: (isIllimite || placesRestantes > 0) ? '#198754' : '#DC3545',
        }}>
          {isIllimite ? 'Places dispo' : (placesRestantes > 0 ? `${placesRestantes} places` : 'Complet')}
        </div>

        {ev.is_multijour && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: 8, padding: '4px 10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0D6EFD', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              DATES
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1e2130', lineHeight: 1.1 }}>
              {1 + (ev.dates_multiples?.length || 0)}
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="event-card-content" style={{ padding: '20px' }}>
        <h3 className="event-card-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          {ev.titre}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <i className="bi bi-calendar3" style={{ color: '#0D6EFD', marginTop: 2 }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ev.is_multijour ? (
                <>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Événement sur {1 + (ev.dates_multiples?.length || 0)} dates</span>
                  <span style={{ fontSize: 11 }}>À partir du {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </>
              ) : (
                <span>{new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bi bi-geo-alt" style={{ color: '#E83E8C' }} />
            {ev.lieu}
          </div>
        </div>

        {/* Catégories disponibles */}
        {ev.categories && ev.categories.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {ev.categories.map((c, idx) => (
              <span key={c.id || idx} style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: isDark ? 'rgba(13,110,253,0.15)' : 'rgba(13,110,253,0.1)',
                color: '#0D6EFD', border: '1px solid rgba(13,110,253,0.2)'
              }}>
                {c.nom}
              </span>
            ))}
          </div>
        )}

        <div className="event-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="event-card-price" style={{ fontSize: 15, fontWeight: 700, color: '#0D6EFD' }}>
            À partir de {Number(prixMin).toLocaleString()} FCFA
          </div>
          <button className="event-card-btn" style={{
            padding: '8px 16px',
            background: 'var(--brand-color)',
            border: 'none', borderRadius: 8,
            color: 'var(--brand-text)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}
