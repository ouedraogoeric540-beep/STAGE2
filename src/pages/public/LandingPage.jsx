import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import api from '../../api/axios'
import AOS from 'aos'
import 'aos/dist/aos.css'
import toast from 'react-hot-toast'

export default function LandingPage() {
  const { isDark, currentPalette } = useTheme()
  const BRAND = currentPalette?.primary || 'var(--brand-color)'
  const BRAND_LIGHT = currentPalette?.primaryLight || '#3b82f6'
  
  const [popularEvents, setPopularEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSending, setContactSending] = useState(false)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactSending(true)
    try {
      await api.post('/contact', contactForm)
      toast.success('Votre message a bien été envoyé !')
      setContactForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error('Une erreur est survenue lors de l\'envoi.')
    } finally {
      setContactSending(false)
    }
  }


  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    })

    api.get('/evenements')
      .then(res => {
        // Même logique que Home.jsx : gère tableau simple ou paginé
        let list = []
        if (res.data && res.data.data) {
          list = res.data.data
        } else if (Array.isArray(res.data)) {
          list = res.data
        }
        setPopularEvents(list.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setTimeout(() => AOS.refresh(), 100)
      })
  }, [])



  return (
    <div style={{ backgroundColor: isDark ? '#0b0d14' : '#fff', color: isDark ? '#e2e8f0' : '#111827', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>

      <style>{`
        .lp-hero-btn { padding: 12px 28px; border-radius: 50px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; white-space: nowrap; width: fit-content; }
        .lp-hero-btn:hover { transform: translateY(-3px); filter: brightness(1.1); color: #fff; }
        .lp-feature-card { border: 1px solid ${isDark ? '#1e293b' : '#e2e8f0'}; padding: 14px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; transition: all 0.25s; cursor: default; }
        .lp-feature-card:hover { border-color: ${BRAND}; background: ${isDark ? '#151829' : '#faf8ff'}; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(92,50,255,0.08); }
        .lp-step-circle { width: 80px; height: 80px; border-radius: 50%; background: ${isDark ? '#151829' : '#fff'}; border: 2px solid ${BRAND}22; display: flex; align-items: center; justify-content: center; font-size: 30px; color: ${BRAND}; margin: 0 auto 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.06); transition: all 0.3s; }
        .lp-step-circle:hover { background: ${BRAND}; color: #fff; transform: scale(1.1); }
        .lp-stat-card { display: flex; align-items: center; padding: 16px 20px; border-radius: 16px; background: ${isDark ? '#151829' : '#fff'}; box-shadow: 0 4px 8px rgba(0,0,0,0.04); transition: all 0.2s; }
        .lp-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
        .lp-event-card { border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 4px 8px rgba(0,0,0,0.04); transition: all 0.3s; background: ${isDark ? '#151829' : '#fff'}; }
        .lp-event-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .lp-float { animation: float 4s ease-in-out infinite; }
        .lp-float-delay { animation: float 4s ease-in-out 1s infinite; }

        @media (max-width: 768px) {
          .lp-hero-btn { flex: 1; padding: 10px 12px; font-size: 13px; width: auto; }
          .lp-hero-btn i { display: none; } /* Hide icon on mobile to save space */
          .lp-stat-card { padding: 12px 14px; }
          .lp-step-circle { width: 64px; height: 64px; font-size: 24px; }
          .lp-feature-card { padding: 12px; gap: 10px; }
        }
        @media (max-width: 576px) {
          .lp-hero-btn { padding: 10px 8px; font-size: 12px; }
          .lp-stat-card { flex-direction: column; text-align: center; gap: 8px; padding: 14px 10px; }
          .lp-stat-card > div:first-child { margin-right: 0 !important; }
        }
      `}</style>

      <PublicNavbar transparent />

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        backgroundImage: `linear-gradient(135deg, rgba(15,10,46,0.93) 0%, rgba(26,17,69,0.9) 40%, rgba(92,50,255,0.82) 100%), url('/hero2.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        overflow: 'hidden', paddingTop: 80
      }}>
        {/* Decorative Elements */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND}22 0%, transparent 70%)`, zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND}15 0%, transparent 70%)`, zIndex: 0 }} />

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
              <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: 50, marginBottom: 24, fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)' }}>
                <i className="bi bi-shield-check me-2" style={{ color: BRAND_LIGHT }}></i>
                Plateforme sécurisée de gestion d'événements
              </div>

              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24, color: '#fff' }}>
                Organisez vos{' '}
                <span style={{ color: BRAND_LIGHT, textShadow: `0 0 40px ${BRAND}66` }}>événements</span>{' '}
                en toute simplicité et sécurité.
              </h1>

              <p style={{ fontSize: '1.15rem', color: '#c4c9d9', marginBottom: 40, maxWidth: 520, lineHeight: 1.7 }}>
                Créez, gérez, vendez vos billets et contrôlez les accès en quelques minutes avec SecurePass.
              </p>

              <div className="d-flex gap-2 gap-md-3 mb-5">
                <Link to="/evenements" className="lp-hero-btn" style={{ backgroundColor: BRAND, color: '#fff', boxShadow: `0 8px 24px ${BRAND}55` }}>
                  Découvrir <span className="d-none d-sm-inline">les événements</span> <i className="bi bi-arrow-right"></i>
                </Link>
                <Link to="/register" className="lp-hero-btn" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                  Organiser <span className="d-none d-sm-inline">un événement</span>
                </Link>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex">
                  {['32', '44', '62'].map((id, i) => (
                    <div key={id} style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid #1a1145', backgroundImage: `url("https://randomuser.me/api/portraits/${i === 1 ? 'women' : 'men'}/${id}.jpg")`, backgroundSize: 'cover', marginLeft: i > 0 ? -12 : 0, zIndex: 3 - i }} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Plus de 10 000 organisateurs</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>nous font confiance <span style={{ color: '#fbbf24' }}>★★★★★</span></div>
                </div>
              </div>
            </div>

            {/* Phone Mockup + Floating Cards */}
            <div className="col-lg-6 d-none d-lg-block position-relative" style={{ minHeight: 480 }}>
              {/* Phone */}
              <div className="lp-float" style={{
                position: 'absolute', left: '15%', top: '25%', transform: 'translateY(-50%)',
                width: 230, height: 440, backgroundColor: '#fff', borderRadius: 28, padding: 10,
                boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 40px ${BRAND}33`, zIndex: 3, border: '5px solid #2a2050'
              }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f8fafc', borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ padding: 14, textAlign: 'center', background: '#fff' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Votre billet</div>
                    <div style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 14, display: 'inline-block' }}>
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=SP-2026-4587-AB&color=5C32FF" alt="QR Code" style={{ width: 110, height: 110 }} />
                    </div>
                    <div style={{ color: BRAND, fontWeight: 800, marginTop: 10, fontSize: 15 }}>Concert Live</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                      <i className="bi bi-calendar me-1"></i> 15 août 2026 - 20:00
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                      <i className="bi bi-geo-alt me-1"></i> Ouagadougou
                    </div>
                    <div style={{ marginTop: 10, padding: '6px 0', backgroundColor: '#dcfce7', color: '#166534', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      <i className="bi bi-check-circle me-1"></i> Validé
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, fontFamily: 'monospace' }}>
                      N° de billet<br />
                      <span style={{ fontWeight: 700, color: '#475569' }}>SP-2026-4587-AB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card - Billets vendus */}
              <div className="lp-float-delay" style={{
                position: 'absolute', right: 0, top: '10%', backgroundColor: '#fff', padding: '14px 18px', borderRadius: 16,
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)', zIndex: 4, minWidth: 180
              }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Billets vendus</div>
                <div className="d-flex justify-content-between align-items-end mt-2">
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>15 842</div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>+23%</div>
                </div>
                <div style={{ width: '100%', height: 40, marginTop: 12, background: `linear-gradient(to right, ${BRAND}22, ${BRAND})`, borderRadius: 6, clipPath: 'polygon(0 100%, 0 60%, 20% 50%, 40% 70%, 60% 40%, 80% 60%, 100% 20%, 100% 100%)' }} />
              </div>

              {/* Floating Card - Paiement sécurisé */}
              <div className="lp-float" style={{
                position: 'absolute', right: '25%', bottom: '15%', backgroundColor: '#fff', padding: '12px 18px', borderRadius: 14,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)', zIndex: 4, display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: `${BRAND}12`, color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  <i className="bi bi-lock-fill"></i>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Paiement sécurisé</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>SSL 256 bits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────── */}
      <section style={{ padding: '50px 0', backgroundColor: isDark ? '#0f1119' : '#fff', borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`, position: 'relative', zIndex: 10, marginTop: -40 }}>
        <div className="container">
          <div className="row g-3 justify-content-center">
            {[
              { label: 'Événements créés', value: '120+', icon: 'bi-calendar-event' },
              { label: 'Billets vendus', value: '15 000+', icon: 'bi-ticket-detailed' },
              { label: 'Participants', value: '9 500+', icon: 'bi-people' },
              { label: 'Tickets validés', value: '98%', icon: 'bi-shield-check' },
            ].map((stat, i) => (
              <div key={i} className="col-6 col-md-3" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="lp-stat-card">
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${BRAND}12`, color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginRight: 14, flexShrink: 0 }}>
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>{stat.value}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA FONCTIONNE ──────────────────── */}
      <section style={{ padding: '90px 0', backgroundColor: isDark ? '#0b0d14' : '#f8fafc' }}>
        <div className="container text-center">
          <h2 style={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 60, fontSize: 32 }} data-aos="fade-up">Comment ça fonctionne ?</h2>
          <div className="row position-relative">
            <div className="d-none d-lg-block" style={{ position: 'absolute', top: 40, left: '12%', right: '12%', height: 2, borderTop: `2px dashed ${BRAND}33`, zIndex: 0 }}></div>

            {[
              { step: 1, title: 'Créer un événement', desc: 'Renseignez les informations de votre événement.', icon: 'bi-calendar-plus' },
              { step: 2, title: 'Publier l\'événement', desc: 'Votre événement est en ligne et visible par tous.', icon: 'bi-globe2' },
              { step: 3, title: 'Les participants réservent', desc: 'Ils réservent et reçoivent leur billet électronique.', icon: 'bi-ticket-perforated' },
              { step: 4, title: 'Scanner les QR Codes', desc: 'Contrôlez les billets en un clin d\'œil le jour J.', icon: 'bi-qr-code-scan' },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-6 col-lg-3 mb-4 mb-lg-0 position-relative" style={{ zIndex: 1 }} data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="lp-step-circle">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <div style={{ color: BRAND, fontWeight: 700, fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Étape {item.step}</div>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 14, color: '#64748b', maxWidth: 220, margin: '0 auto' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ──────────────────────────── */}
      <section id="fonctionnalites" style={{ padding: '90px 0', backgroundColor: isDark ? '#0f1119' : '#fff' }}>
        <div className="container">
          <h2 className="text-center" style={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 50, fontSize: 32 }} data-aos="fade-up">Nos fonctionnalités</h2>
          <div className="row g-3">
            {[
              { icon: 'bi-calendar-event', text: "Création d'événements" },
              { icon: 'bi-ticket-detailed', text: "Vente de billets" },
              { icon: 'bi-credit-card-2-front', text: "Paiement sécurisé" },
              { icon: 'bi-qr-code', text: "QR Code unique" },
              { icon: 'bi-shield-lock', text: "Contrôle des accès" },
              { icon: 'bi-speedometer2', text: "Tableau de bord" },
              { icon: 'bi-pie-chart', text: "Statistiques détaillées" },
              { icon: 'bi-people', text: "Gestion des participants" },
              { icon: 'bi-file-earmark-spreadsheet', text: "Export Excel / PDF" },
              { icon: 'bi-bell', text: "Notifications" },
              { icon: 'bi-collection', text: "Multi-événements" },
              { icon: 'bi-headset', text: "Support 24/7" },
            ].map((f, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3" data-aos="fade-up" data-aos-delay={(i % 4) * 100}>
                <div className="lp-feature-card">
                  <i className={`bi ${f.icon}`} style={{ color: BRAND, fontSize: 20, flexShrink: 0 }}></i>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#cbd5e1' : '#334155' }}>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÉVÉNEMENTS POPULAIRES ──────────────────── */}
      <section style={{ padding: '90px 0', backgroundColor: isDark ? '#0b0d14' : '#f8fafc' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3" data-aos="fade-up">
            <h2 style={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0, fontSize: 32 }}>Événements populaires</h2>
            <Link to="/evenements" className="d-flex align-items-center gap-2" style={{ color: BRAND, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: `1.5px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, padding: '10px 20px', borderRadius: 50 }}>
              Voir tous les événements <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="col-6 col-md-6 col-lg-3">
                  <div className="lp-event-card h-100 d-flex flex-column placeholder-glow" style={{ border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                    <div className="placeholder" style={{ height: 170, width: '100%', backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}></div>
                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div className="placeholder col-8 mb-3" style={{ height: 18, borderRadius: 4, backgroundColor: isDark ? '#2a2d3e' : '#cbd5e1' }}></div>
                      <div className="placeholder col-6 mb-2" style={{ height: 14, borderRadius: 4, backgroundColor: isDark ? '#2a2d3e' : '#cbd5e1' }}></div>
                      <div className="placeholder col-10 mb-4" style={{ height: 14, borderRadius: 4, backgroundColor: isDark ? '#2a2d3e' : '#cbd5e1' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : popularEvents.length > 0 ? popularEvents.map((evt, i) => (
              <div key={evt.id} className="col-6 col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="lp-event-card h-100 d-flex flex-column">
                  <div style={{
                    height: 170, backgroundColor: '#e2e8f0',
                    backgroundImage: `url(${evt.banniere || evt.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=400'})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', bottom: 12, left: 12, backgroundColor: BRAND, color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {evt.type || 'Public'}
                    </div>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h5 style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 16, marginBottom: 12 }}>{evt.titre}</h5>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 5 }}><i className="bi bi-geo-alt me-2"></i>{evt.lieu}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}><i className="bi bi-calendar me-2"></i>{new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: 12, color: '#94a3b8' }}><i className="bi bi-person me-1"></i> {evt.capacite_max ? `${evt.capacite_max} places` : 'Illimité'}</div>
                      <Link to={`/evenements/${evt.id}`} className="btn btn-sm text-white rounded-pill px-3 py-1" style={{ backgroundColor: BRAND, fontWeight: 700, fontSize: 12 }}>Réserver</Link>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12 text-center text-muted" style={{ padding: '40px 0' }}>Aucun événement populaire pour le moment.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── POURQUOI / TÉMOIGNAGE / QR ──────────────── */}
      <section style={{ padding: '90px 0', backgroundColor: isDark ? '#0f1119' : '#fff' }}>
        <div className="container">
          <div className="row g-5 align-items-stretch">
            <div className="col-lg-4">
              <h2 style={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 28, fontSize: 24 }}>Pourquoi choisir SecurePass ?</h2>
              <ul className="list-unstyled" style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#475569' }}>
                {[
                  "Interface simple et intuitive",
                  "Sécurité maximale des billets",
                  "QR Code impossible à falsifier",
                  "Validation en moins d'une seconde",
                  "Tableau de bord complet",
                  "Accessible sur tous vos appareils"
                ].map((item, i) => (
                  <li key={i} className="mb-3 d-flex align-items-center">
                    <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, fontSize: 12, flexShrink: 0 }}>
                      <i className="bi bi-check-lg"></i>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-4">
              <h4 style={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 20 }}>Ils nous font confiance</h4>
              <div style={{ backgroundColor: isDark ? '#151829' : '#f8fafc', padding: 30, borderRadius: 20, position: 'relative', height: 'calc(100% - 48px)' }}>
                <i className="bi bi-quote" style={{ fontSize: 70, color: `${BRAND}18`, position: 'absolute', top: 8, left: 15, lineHeight: 1 }}></i>
                <div style={{ color: '#fbbf24', fontSize: 14, marginBottom: 15 }}>★★★★★</div>
                <p style={{ fontStyle: 'italic', color: isDark ? '#cbd5e1' : '#334155', fontSize: 15, marginBottom: 24, position: 'relative', zIndex: 1, lineHeight: 1.7 }}>
                  "SecurePass a rendu la gestion de nos événements beaucoup plus facile et professionnelle. Les participants adorent !"
                </p>
                <div className="d-flex align-items-center">
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundImage: 'url("https://randomuser.me/api/portraits/men/32.jpg")', backgroundSize: 'cover', marginRight: 14, border: `2px solid ${BRAND}33` }} />
                  <div>
                    <div style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 14 }}>Eric K.</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Organisateur d'événements</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div style={{ backgroundColor: isDark ? '#151829' : '#f8fafc', padding: 30, borderRadius: 20, textAlign: 'center', border: `1px solid ${BRAND}18`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a', marginBottom: 10, fontSize: 20 }}>Billet sécurisé,<br />contrôle instantané.</h4>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 25 }}>Scannez, validez, et c'est fait !</p>
                <div style={{ width: 150, height: 280, backgroundColor: '#fff', borderRadius: 24, border: '4px solid #1e293b', position: 'relative', overflow: 'hidden', boxShadow: `0 15px 30px rgba(0,0,0,0.12), 0 0 20px ${BRAND}11` }}>
                  <div style={{ padding: 18, textAlign: 'center' }}>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SECUREPASS-DEMO&color=5C32FF" alt="QR" style={{ width: 100, height: 100, marginTop: 15, marginBottom: 25 }} />
                    <div style={{ backgroundColor: '#22c55e', color: '#fff', padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                      <i className="bi bi-check-circle me-1"></i> Scanné et validé !
                    </div>
                  </div>
                </div>
                <Link to="/evenements" style={{ color: BRAND, fontWeight: 700, fontSize: 14, marginTop: 20, textDecoration: 'none' }}>
                  Voir en action <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ──────────────────────────────── */}
      <section id="contact-form" style={{ padding: '90px 0', backgroundColor: isDark ? '#0b0d14' : '#fafafa' }}>
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center mb-5">
              <h2 style={{ fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 15, fontSize: 32 }}>Contactez-nous</h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>Une question ? Un besoin spécifique ? Notre équipe est là pour vous répondre.</p>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <form onSubmit={handleContactSubmit} style={{ backgroundColor: isDark ? '#151829' : '#fff', padding: 40, borderRadius: 24, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginBottom: 6 }}>Nom complet</label>
                    <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, backgroundColor: isDark ? '#0b0d14' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} placeholder="Votre nom" onFocus={(e) => e.target.style.borderColor = BRAND} onBlur={(e) => e.target.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0'} />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginBottom: 6 }}>Email</label>
                    <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, backgroundColor: isDark ? '#0b0d14' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} placeholder="votre@email.com" onFocus={(e) => e.target.style.borderColor = BRAND} onBlur={(e) => e.target.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0'} />
                  </div>
                  <div className="col-12">
                    <label style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginBottom: 6 }}>Message</label>
                    <textarea required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows="5" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, backgroundColor: isDark ? '#0b0d14' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 14, outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }} placeholder="Comment pouvons-nous vous aider ?" onFocus={(e) => e.target.style.borderColor = BRAND} onBlur={(e) => e.target.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0'}></textarea>
                  </div>
                  <div className="col-12 text-center mt-4">
                    <button type="submit" disabled={contactSending} style={{ padding: '14px 32px', backgroundColor: BRAND, color: '#fff', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: 15, transition: 'all 0.3s', boxShadow: `0 8px 20px ${BRAND}44`, width: '100%', maxWidth: 250, opacity: contactSending ? 0.7 : 1 }} onMouseOver={(e) => { e.target.style.transform = contactSending ? 'none' : 'translateY(-2px)'; e.target.style.filter = contactSending ? 'none' : 'brightness(1.1)' }} onMouseOut={(e) => { e.target.style.transform = 'none'; e.target.style.filter = 'none' }}>
                      {contactSending ? 'Envoi en cours...' : <>Envoyer le message <i className="bi bi-send ms-2"></i></>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────── */}
      <section id="cta" style={{ margin: '0 20px 40px 20px', padding: '70px 24px', borderRadius: 28, background: `linear-gradient(135deg, ${BRAND}, #3b1eb0)`, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, fontSize: 350, color: 'rgba(255,255,255,0.04)', lineHeight: 1, pointerEvents: 'none' }}><i className="bi bi-calendar-check"></i></div>
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div style={{ width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <i className="bi bi-calendar-plus" style={{ fontSize: 28 }}></i>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 15 }}>Prêt à organiser votre prochain événement ?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>
            Rejoignez des milliers d'organisateurs et offrez une expérience inoubliable.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/register" className="btn px-5 py-3 rounded-pill fw-bold" style={{ backgroundColor: '#fff', color: BRAND, fontSize: 15 }}>
              Créer un événement
            </Link>
            <Link to="/evenements" className="btn px-5 py-3 rounded-pill fw-bold" style={{ backgroundColor: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', fontSize: 15 }}>
              Découvrir les événements
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <Footer />
    </div>
  )
}
