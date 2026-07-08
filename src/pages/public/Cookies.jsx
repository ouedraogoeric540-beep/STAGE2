import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function Cookies() {
  const { isDark } = useTheme()

  const sections = [
    {
      id: 'definition',
      icon: 'bi-info-circle',
      title: '1. Qu\'est-ce qu\'un Cookie ?',
      content: "Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet de mémoriser vos actions et préférences (nom d'utilisateur, langue, taille de police, etc.) pour vous offrir une navigation plus fluide."
    },
    {
      id: 'utilisation',
      icon: 'bi-gear',
      title: '2. Notre utilisation des Cookies',
      content: "Sur SecurePass, nous utilisons très peu de cookies. Nous n'utilisons que des cookies strictement nécessaires au fonctionnement technique de la plateforme (par exemple : le token d'authentification ou vos préférences d'affichage sombre/clair)."
    },
    {
      id: 'types',
      icon: 'bi-tags',
      title: '3. Types de Cookies',
      content: "Nous utilisons exclusivement des cookies de session (qui s'effacent à la fermeture du navigateur) et des cookies de sécurité persistants limités dans le temps pour maintenir votre connexion (ex: token Sanctum)."
    },
    {
      id: 'consentement',
      icon: 'bi-shield-check',
      title: '4. Cookies tiers et publicité',
      content: "SecurePass n'utilise AUCUN cookie publicitaire ou de traçage tiers (comme Facebook Pixel ou Google Ads). Votre navigation n'est pas suivie à des fins commerciales."
    },
    {
      id: 'gestion',
      icon: 'bi-sliders',
      title: '5. Gestion de vos préférences',
      content: "Étant donné que nous n'utilisons que des cookies fonctionnels essentiels, ceux-ci ne peuvent pas être désactivés sans bloquer le fonctionnement de l'application (comme la connexion). Vous pouvez toutefois configurer votre navigateur pour bloquer tous les cookies, mais SecurePass ne fonctionnera plus correctement."
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '40px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: 28, marginBottom: 16 }}>
              <i className="bi bi-cookie" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Politique des Cookies</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
              Comment nous utilisons les cookies pour améliorer votre expérience.
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
                         onMouseEnter={e => { e.target.style.color = '#f59e0b'; e.target.style.transform = 'translateX(4px)' }}
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
                
                <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12, padding: 20, marginBottom: 40, borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Navigation transparente :</strong> Nous respectons votre vie privée. Nos cookies sont uniquement là pour faire fonctionner la plateforme. Pour plus d'informations, consultez notre <Link to="/confidentialite" style={{ color: '#f59e0b', fontWeight: 600 }}>Politique de Confidentialité</Link>.
                  </p>
                </div>

                {sections.map((sec, index) => (
                  <section id={sec.id} key={sec.id} style={{ marginBottom: index === sections.length - 1 ? 0 : 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? '#252839' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
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
