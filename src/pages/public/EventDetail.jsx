import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'
import api, { getImageUrl } from '../../api/axios'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [ev, setEv]           = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const quantite = 1

  useEffect(() => {
    api.get(`/evenements/${id}`)
      .then((r) => { 
        setEv(r.data); 
        if (r.data.categories?.length) {
          const firstAvailable = r.data.categories.find(c => (c.quantite_total - c.quantite_vendue) > 0);
          setSelected(firstAvailable || r.data.categories[0]);
        }
      })
      .catch(() => { toast.error('Événement introuvable.'); navigate('/') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
      <div className="sp-spinner" />
    </div>
  )

  const total = selected ? Number(selected.prix) * quantite : 0
  const estGratuit = selected?.prix == 0

  return (
    <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{
        height: 56, padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="SecurePass" style={{ width: 28, height: 28, objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none' }} />
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1, display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
            <span style={{ color: '#0D6EFD' }}>
              <span style={{ fontSize: '1.2em' }}>S</span>ECURE
            </span>
            <span style={{ color: '#E83E8C' }}>
              <span style={{ fontSize: '1.2em' }}>P</span>ASS
            </span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <i className="bi bi-moon-stars-fill" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">

          {/* Colonne gauche — Détail événement */}
          <div className="col-12 col-lg-7">
            <div className="card-custom h-100" style={{ padding: 0, overflow: 'hidden' }}>

              {/* Image */}
              <div style={{ position: 'relative' }}>
                {ev.image ? (
                  <img
                    src={getImageUrl(ev.image)}
                    alt={ev.titre}
                    style={{ width: '100%', height: 360, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: 360,
                    background: 'linear-gradient(135deg, #1e293b, #273142)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bi bi-calendar-event" style={{ fontSize: 64, color: 'var(--border)', opacity: 0.5 }} />
                  </div>
                )}
                {ev.type && (
                  <span className="badge bg-primary position-absolute m-3"
                    style={{ top: 12, left: 12, borderRadius: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {ev.type}
                  </span>
                )}
              </div>

              <div style={{ padding: '32px' }}>
                <h1 className="fw-bold mb-3" style={{ color: 'var(--text-primary)', fontSize: 28, lineHeight: 1.2 }}>
                  {ev.titre}
                </h1>

                {ev.description && (
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                    {ev.description}
                  </p>
                )}

                <hr style={{ borderColor: 'var(--border)', opacity: 1 }} />

                <div className="row g-3 mt-1">
                  <div className="col-12 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: 'var(--brand-glow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="bi bi-calendar3" style={{ fontSize: 20, color: 'var(--brand-color)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, marginBottom: 4 }}>
                          {ev.is_multijour ? 'Dates & Heures' : 'Date & Heure'}
                        </small>
                        {ev.is_multijour ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                              <i className="bi bi-dot"></i> {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </strong>
                            {ev.dates_multiples?.map((d, idx) => (
                              <strong key={idx} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                                <i className="bi bi-dot"></i> {new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </strong>
                            ))}
                            <small style={{ fontSize: 10, color: 'var(--brand-color)', fontWeight: 600, marginTop: 4 }}>
                              *Un seul ticket donne accès à toutes ces dates.
                            </small>
                          </div>
                        ) : (
                          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            {new Date(ev.date).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </strong>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{
                        width: 46, height: 46, borderRadius: 12,
                        background: 'rgba(16,185,129,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="bi bi-geo-alt-fill" style={{ fontSize: 20, color: '#10b981' }} />
                      </div>
                      <div>
                        <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Lieu / Emplacement</small>
                        <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{ev.lieu}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Colonne droite — Commande */}
          <div className="col-12 col-lg-5">
            <div style={{ position: 'sticky', top: 20, padding: '24px', background: 'transparent' }}>

              {/* Mini recap */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', borderRadius: 10, marginBottom: 24,
                backgroundColor: 'rgba(13, 110, 253, 0.05)',
              }}>
                {ev.image ? (
                  <img src={getImageUrl(ev.image)} alt={ev.titre}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 8, background: 'var(--border)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-calendar-event" style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>Votre commande pour :</small>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.titre}
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    <i className="bi bi-geo-alt me-1" />{ev.lieu}
                  </small>
                </div>
              </div>

              {/* Choix tickets */}
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                <i className="bi bi-ticket-perforated-fill me-2" style={{ color: 'var(--brand-color)' }} />
                Choix des tickets
              </h5>

              <div className="d-flex flex-column gap-2 mb-4">
                {ev.categories?.map((cat) => {
                  const isIllimite = cat.quantite_total == -1
                  const dispo = isIllimite ? 999999 : (cat.quantite_total - cat.quantite_vendue)
                  const isSelected = selected?.id === cat.id
                  return (
                    <label
                      key={cat.id}
                      onClick={() => dispo > 0 && setSelected(cat)}
                      style={{
                        padding: '16px 14px', cursor: dispo > 0 ? 'pointer' : 'not-allowed',
                        borderBottom: `1px solid var(--border)`,
                        background: isSelected ? 'rgba(13, 110, 253, 0.05)' : 'transparent',
                        borderRadius: isSelected ? 8 : 0,
                        border: isSelected ? '1px solid var(--brand-color)' : '1px solid transparent',
                        borderBottom: isSelected ? '1px solid var(--brand-color)' : '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        opacity: dispo > 0 ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio" name="categorie"
                          checked={isSelected} readOnly
                          style={{ accentColor: 'var(--brand-color)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{cat.nom}</div>
                          <small style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {isIllimite ? 'Places illimitées' : (dispo > 0 ? `${dispo} places disponibles` : 'Épuisé')}
                          </small>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: cat.prix == 0 ? '#10b981' : 'var(--brand-color)', fontSize: 15 }}>
                        {cat.prix == 0 ? 'Gratuit' : `${Number(cat.prix).toLocaleString()} F CFA`}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Quantité masquée (1 place par défaut) */}

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 0', marginTop: 12, marginBottom: 20,
                borderTop: '2px dashed var(--border)',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Montant total à payer</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: estGratuit ? '#10b981' : 'var(--brand-color)' }}>
                  {estGratuit ? 'Gratuit' : `${total.toLocaleString()} F CFA`}
                </span>
              </div>

              {/* Bouton paiement */}
              <button
                className="btn btn-brand w-100"
                style={{ 
                  padding: '13px', 
                  fontSize: 15, 
                  textTransform: 'uppercase', 
                  letterSpacing: 1,
                  opacity: (!selected || (selected.quantite_total != -1 && (selected.quantite_total - selected.quantite_vendue) <= 0)) ? 0.5 : 1
                }}
                disabled={!selected || (selected.quantite_total != -1 && (selected.quantite_total - selected.quantite_vendue) <= 0)}
                onClick={() => navigate(`/reservation/${ev.id}`, {
                  state: { categorieId: selected?.id, quantite }
                })}
              >
                <i className="bi bi-credit-card-2-back-fill me-2" />
                {!selected || (selected.quantite_total != -1 && (selected.quantite_total - selected.quantite_vendue) <= 0) 
                  ? 'Épuisé' 
                  : (estGratuit ? 'Obtenir mon ticket' : 'Passer au paiement')}
              </button>

              <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 12,
                color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12 }}>
                <i className="bi bi-arrow-left me-1" /> Retour aux événements
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}