import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function Remboursement() {
  const { isDark } = useTheme()

  const sections = [
    {
      id: 'politique_generale',
      icon: 'bi-x-circle',
      title: '1. Politique Générale (Non-Remboursement)',
      content: "SecurePass agit en tant que plateforme technologique d'émission de billets. De manière générale, et sauf annulation de l'événement, AUCUN remboursement automatique ou de droit n'est accordé après l'achat d'un ticket."
    },
    {
      id: 'organisateur',
      icon: 'bi-person-badge',
      title: '2. Rôle de l\'Organisateur',
      content: "L'organisateur de l'événement est le seul responsable des conditions spécifiques d'annulation ou de remboursement de son événement. Toute demande de remboursement doit être directement adressée à l'organisateur."
    },
    {
      id: 'annulation_evenement',
      icon: 'bi-calendar-x',
      title: '3. Annulation d\'un événement',
      content: "En cas d'annulation pure et simple d'un événement par l'organisateur, SecurePass coordonnera, dans la mesure du possible, le remboursement des participants, déduction faite des frais de transaction déjà engagés."
    },
    {
      id: 'frais',
      icon: 'bi-cash-coin',
      title: '4. Frais de service',
      content: "En cas d'accord de remboursement exceptionnel (approuvé par l'organisateur), les frais de service de la plateforme ou de transaction Mobile Money ne sont généralement pas remboursables."
    },
    {
      id: 'litiges',
      icon: 'bi-shield-exclamation',
      title: '5. Litiges et fraudes',
      content: "Toute fraude avérée, utilisation d'un moyen de paiement volé, ou réclamation abusive pourra entraîner la suspension immédiate du compte et l'annulation des billets sans remboursement."
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '40px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: 28, marginBottom: 16 }}>
              <i className="bi bi-wallet2" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Politique de Remboursement</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
              Conditions d'achat et de remboursement des billets.
              <br /><span style={{ fontSize: 13, opacity: 0.7 }}>Dernière mise à jour : {new Date().getFullYear()}</span>
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 d-none d-lg-block">
              <div style={{ position: 'sticky', top: 100, background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Sommaire</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sections.map(sec => (
                    <li key={sec.id}>
                      <a href={`#${sec.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                         onMouseEnter={e => { e.target.style.color = '#ef4444'; e.target.style.transform = 'translateX(4px)' }}
                         onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.transform = 'translateX(0)' }}>
                        <i className={`bi ${sec.icon}`} style={{ fontSize: 12 }} /> {sec.title.substring(3)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, padding: '40px' }}>
                
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, padding: 20, marginBottom: 40, borderLeft: '4px solid #ef4444' }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Attention :</strong> L'achat d'un billet est un acte définitif. Assurez-vous de vos disponibilités avant de finaliser une transaction. Pour tout problème technique, n'hésitez pas à nous <Link to="/contact" style={{ color: '#ef4444', fontWeight: 600 }}>contacter</Link>.
                  </p>
                </div>

                {sections.map((sec, index) => (
                  <section id={sec.id} key={sec.id} style={{ marginBottom: index === sections.length - 1 ? 0 : 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <i className={`bi ${sec.icon}`} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sec.title}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: 0, paddingLeft: 48 }}>
                      {sec.content}
                    </p>
                  </section>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
