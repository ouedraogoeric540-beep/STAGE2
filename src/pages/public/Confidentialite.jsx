import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function Confidentialite() {
  const { isDark } = useTheme()

  const sections = [
    {
      id: 'collecte',
      icon: 'bi-database-down',
      title: '1. Collecte des données',
      content: "SecurePass collecte uniquement les informations strictement nécessaires à la fourniture de nos services. Cela inclut votre nom, votre adresse email, votre numéro de téléphone (facultatif) et les informations relatives à vos réservations, transactions financières ou événements créés."
    },
    {
      id: 'utilisation',
      icon: 'bi-cpu',
      title: '2. Utilisation de vos données',
      content: "Vos données sont utilisées dans le but unique de garantir l'émission, la gestion et la vérification des billets numériques, ainsi que pour les paiements. Nous ne revendons en aucun cas vos informations à des tiers à des fins publicitaires."
    },
    {
      id: 'conservation',
      icon: 'bi-archive',
      title: '3. Conservation des données',
      content: "Nous conservons vos données personnelles tant que votre compte est actif. L'historique financier et les logs de sécurité (Ledger) sont conservés à des fins légales et d'audit pendant la durée réglementaire, même après la suppression du compte."
    },
    {
      id: 'securite',
      icon: 'bi-shield-lock',
      title: '4. Sécurité et Protection',
      content: "Nous mettons en œuvre des mesures de sécurité avancées (chiffrement, hachage des mots de passe, protection CSRF/XSS, algorithme cryptographique pour les QR Codes) pour protéger vos données contre les accès non autorisés, la modification ou la suppression."
    },
    {
      id: 'droits',
      icon: 'bi-person-lines-fill',
      title: '5. Vos droits',
      content: "Conformément à la législation en vigueur (ex: RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment via les paramètres de votre compte ou en nous contactant."
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '40px 0' }}>
        <div className="container">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 28, marginBottom: 16 }}>
              <i className="bi bi-shield-check" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Politique de Confidentialité</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
              La protection de vos données personnelles est notre priorité absolue.
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
                         onMouseEnter={e => { e.target.style.color = '#10b981'; e.target.style.transform = 'translateX(4px)' }}
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
                
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, padding: 20, marginBottom: 40, borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Notre engagement :</strong> Nous traitons vos données de manière transparente, confidentielle et sécurisée. 
                    Si vous avez des préoccupations concernant vos données, n'hésitez pas à consulter la section <Link to="/contact" style={{ color: '#10b981', fontWeight: 600 }}>Contact</Link>.
                  </p>
                </div>

                {sections.map((sec, index) => (
                  <section id={sec.id} key={sec.id} style={{ marginBottom: index === sections.length - 1 ? 0 : 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
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
