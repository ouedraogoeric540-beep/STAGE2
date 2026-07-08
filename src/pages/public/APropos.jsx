import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../../components/common/Logo'

export default function APropos() {
  const { isDark } = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '60px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 60, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <Logo size="lg" />
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Révolutionner la billetterie</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
              SecurePass est une plateforme moderne, sécurisée et intuitive conçue pour 
              simplifier la gestion d'événements et le contrôle d'accès.
            </p>
          </div>

          <div className="row g-5 align-items-center mb-5">
            <div className="col-md-6">
              <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 24, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Notre Mission</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                  Nous avons créé SecurePass avec une idée simple : mettre fin aux fraudes, aux faux billets et aux longues files d'attente à l'entrée des événements.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                  En utilisant des algorithmes cryptographiques pour générer des QR Codes uniques et dynamiques, nous garantissons aux organisateurs une tranquillité d'esprit totale et aux participants une expérience fluide.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { icon: 'bi-shield-check', title: 'Sécurité absolue', color: '#10b981' },
                  { icon: 'bi-lightning-charge', title: 'Contrôle instantané', color: '#f59e0b' },
                  { icon: 'bi-wallet2', title: 'Paiements intégrés', color: '#0D6EFD' },
                  { icon: 'bi-graph-up', title: 'Suivi en direct', color: '#8b5cf6' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
                      <i className={item.icon} />
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0D6EFD 0%, #4338ca 100%)', borderRadius: 24, padding: '60px 40px', textAlign: 'center', color: '#fff', boxShadow: '0 20px 40px rgba(13,110,253,0.3)' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Prêt à organiser votre événement ?</h2>
            <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 600, margin: '0 auto 32px' }}>
              Rejoignez des centaines d'organisateurs qui font confiance à SecurePass pour la gestion de leur billetterie.
            </p>
            <a href="/register" className="btn btn-light btn-lg" style={{ borderRadius: 12, fontWeight: 700, padding: '12px 32px', color: '#0D6EFD' }}>
              Créer un compte Organisateur
            </a>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}
