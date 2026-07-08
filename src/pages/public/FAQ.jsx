import PublicNavbar from '../../components/public/PublicNavbar'
import Footer from '../../components/common/Footer'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function FAQ() {
  const { isDark } = useTheme()
  const [activeFaq, setActiveFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: "Comment créer un événement sur SecurePass ?",
      answer: "Une fois votre compte Organisateur créé et validé, rendez-vous dans votre tableau de bord, cliquez sur 'Créer un événement' et remplissez les informations requises (date, lieu, catégories de billets). Votre événement sera soumis à validation par notre équipe."
    },
    {
      id: 2,
      question: "Comment sont gérés les paiements ?",
      answer: "Les paiements sont traités de manière sécurisée via notre intégration Mobile Money. L'argent est collecté par SecurePass. Vous pouvez ensuite demander un retrait depuis votre tableau de bord financier, déduction faite de notre commission de 7%."
    },
    {
      id: 3,
      question: "Puis-je annuler un billet ou rembourser un participant ?",
      answer: "En tant qu'organisateur, vous êtes responsable de votre politique de remboursement. SecurePass ne rembourse pas automatiquement les participants. Si vous décidez d'annuler un événement, vous devrez nous contacter pour coordonner les remboursements."
    },
    {
      id: 4,
      question: "Comment fonctionne le scan des billets ?",
      answer: "Les billets achetés contiennent un QR code cryptographique unique. Le jour de l'événement, vos agents (que vous pouvez créer depuis votre espace) utiliseront l'application pour scanner les billets. Un billet scanné devient immédiatement 'utilisé' pour éviter la fraude."
    },
    {
      id: 5,
      question: "Mon compte est bloqué, que faire ?",
      answer: "Si vous entrez un mot de passe incorrect plusieurs fois de suite, votre compte sera temporairement bloqué par sécurité. Patientez quelques minutes ou utilisez la fonction 'Mot de passe oublié'. Si le problème persiste, contactez le support."
    }
  ]

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ backgroundColor: 'var(--bg-body)', flex: 1, padding: '60px 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 60, animation: 'fadeInDown 0.5s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(13, 110, 253, 0.1)', color: '#0D6EFD', fontSize: 28, marginBottom: 16 }}>
              <i className="bi bi-question-circle" />
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Centre d'aide</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Trouvez rapidement des réponses à vos questions. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous <Link to="/contact" style={{ color: '#0D6EFD', fontWeight: 600 }}>contacter</Link>.
            </p>
          </div>

          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {faqs.map(faq => {
                const isActive = activeFaq === faq.id;
                return (
                  <div key={faq.id} style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: 16, 
                    border: `1px solid ${isActive ? '#0D6EFD' : (isDark ? '#2a2d3e' : '#e2e8f0')}`, 
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}>
                    <button 
                      onClick={() => toggleFaq(faq.id)}
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '20px 24px', 
                        background: 'transparent', 
                        border: 'none', 
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: isActive ? '#0D6EFD' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: 16
                      }}
                    >
                      {faq.question}
                      <i className={`bi bi-chevron-${isActive ? 'up' : 'down'}`} style={{ transition: 'transform 0.3s ease' }} />
                    </button>
                    
                    <div style={{ 
                      maxHeight: isActive ? 500 : 0, 
                      opacity: isActive ? 1 : 0, 
                      overflow: 'hidden', 
                      transition: 'all 0.3s ease',
                      padding: isActive ? '0 24px 24px 24px' : '0 24px'
                    }}>
                      <div style={{ 
                        paddingTop: 16, 
                        borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        fontSize: 15
                      }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}
