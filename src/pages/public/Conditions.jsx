import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function Conditions() {
  const { isDark } = useTheme()

  const sections = [
    {
      id: 'acceptation',
      icon: 'bi-check2-circle',
      title: '1. Acceptation des conditions',
      content: "En accédant et en utilisant l'application SecurePass, vous acceptez de vous conformer aux présentes conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services. L'utilisation continue de la plateforme constitue une acceptation formelle des CGU en vigueur."
    },
    {
      id: 'service',
      icon: 'bi-ticket-detailed',
      title: '2. Description du service',
      content: "SecurePass est une plateforme de billetterie et de contrôle d'accès numérique. Elle permet aux organisateurs de créer et gérer des événements, et aux utilisateurs d'acheter, stocker et présenter leurs tickets numériques en toute sécurité grâce à un QR code unique."
    },
    {
      id: 'comptes',
      icon: 'bi-person-badge',
      title: '3. Comptes utilisateurs',
      content: "Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion. Toute action effectuée depuis votre compte sera considérée comme ayant été effectuée par vous-même. En cas d'utilisation non autorisée, vous devez immédiatement nous en informer."
    },
    {
      id: 'organisateurs',
      icon: 'bi-calendar-star',
      title: '4. Obligations des organisateurs',
      content: "Les organisateurs s'engagent à fournir des informations véridiques sur leurs événements. SecurePass se réserve le droit d'annuler ou de suspendre un événement suspecté de fraude. Les fonds collectés sont soumis à notre commission standard (7%) avant reversement."
    },
    {
      id: 'responsabilite',
      icon: 'bi-shield-exclamation',
      title: '5. Limitation de Responsabilité',
      content: "L'équipe SecurePass s'efforce de maintenir la plateforme accessible 24/7. Toutefois, nous déclinons toute responsabilité en cas d'interruption temporaire pour des raisons de maintenance technique, pannes de serveur ou de force majeure."
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '40px 0' }}>
        <div className="container">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(13, 110, 253, 0.1)', color: '#0D6EFD', fontSize: 28, marginBottom: 16 }}>
              <i className="bi bi-file-earmark-text" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Conditions Générales d'Utilisation</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
              Veuillez lire attentivement nos conditions avant d'utiliser SecurePass.
              <br /><span style={{ fontSize: 13, opacity: 0.7 }}>Dernière mise à jour : {new Date().getFullYear()} - Version 1.0</span>
            </p>
          </div>

          <div className="row g-4">
            {/* Sidebar Navigation */}
            <div className="col-lg-3 d-none d-lg-block">
              <div style={{ position: 'sticky', top: 100, background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Sommaire</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sections.map(sec => (
                    <li key={sec.id}>
                      <a href={`#${sec.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                         onMouseEnter={e => { e.target.style.color = '#0D6EFD'; e.target.style.transform = 'translateX(4px)' }}
                         onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.transform = 'translateX(0)' }}>
                        <i className={`bi ${sec.icon}`} style={{ fontSize: 12 }} /> {sec.title.substring(3)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Content */}
            <div className="col-lg-9">
              <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, padding: '40px' }}>
                
                <div style={{ background: 'rgba(13, 110, 253, 0.05)', borderRadius: 12, padding: 20, marginBottom: 40, borderLeft: '4px solid #0D6EFD' }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Bienvenue sur SecurePass.</strong> En accédant à notre site ou en utilisant nos services de billetterie, vous acceptez d'être lié par ces CGU. 
                    Si vous avez des questions, vous pouvez nous <Link to="/contact" style={{ color: '#0D6EFD', fontWeight: 600 }}>contacter</Link>.
                  </p>
                </div>

                {sections.map((sec, index) => (
                  <section id={sec.id} key={sec.id} style={{ marginBottom: index === sections.length - 1 ? 0 : 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D6EFD' }}>
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
