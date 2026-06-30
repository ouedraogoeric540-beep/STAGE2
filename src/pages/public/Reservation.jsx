import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import TicketExportCard from '../../components/common/TicketExportCard'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'

const estGratuit = new URLSearchParams(window.location.search).get('gratuit') === '1'

const STEPS = estGratuit
  ? ['Vos informations', 'Confirmation']
  : ['Vos informations', 'Paiement', 'Confirmation']

export default function Reservation() {
  const { id } = useParams()
  const { state } = useLocation()
  const { isDark } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [ev, setEv] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadingImg, setDownloadingImg] = useState(false)
  const [ticketToExport, setTicketToExport] = useState(null)
  const ticketRef = useRef(null)
  const [form, setForm] = useState({
    nom: user?.name || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  })

  const loggedInMode = isAuthenticated
  const categorieId = state?.categorieId
  const categorie = ev?.categories?.find((c) => c.id === categorieId)

  useEffect(() => {
    if (!categorieId) { navigate(`/evenements/${id}`); return }
    api.get(`/evenements/${id}`).then((r) => setEv(r.data))
  }, [id, categorieId, navigate])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Étape 1 — Réserver
  const reserver = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const reservationData = {
        evenement_id: id,
        categorie_id: categorieId,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
      }

      if (loggedInMode) {
        reservationData.nom = user.name
        reservationData.email = user.email
        reservationData.telephone = user.telephone

      }

      const res = await api.post('/tickets/reserver', reservationData)
      setTicket(res.data.ticket)

      // Si ticket gratuit → confirmer paiement automatiquement
      if (res.data.ticket.prix_paye == 0) {
        const confirm = await api.post(`/tickets/${res.data.ticket.id}/confirmer-paiement`)
        setTicket(confirm.data.ticket)
        setStep(2) // Aller directement à la confirmation
        toast.success('Ticket gratuit généré !')
      } else {
        setStep(1) // Aller au paiement normal
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation.')
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 — Confirmer paiement
  const confirmerPaiement = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/tickets/${ticket.id}/confirmer-paiement`)
      setTicket(res.data.ticket)
      setStep(2)
      toast.success('Paiement confirmé ! Votre ticket a été envoyé par email.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du paiement.')
    } finally {
      setLoading(false)
    }
  }


  // Étape 3 — Télécharger PDF
  const telechargerPDF = async (ticketId, codeUnique) => {
    setDownloading(ticketId)
    try {
      // Utiliser axios normal — le backend retourne du base64
      const res = await api.get(`/tickets/${ticketId}/pdf`)

      const { base64, filename } = res.data

      // Convertir base64 en blob
      const byteChars = atob(base64)
      const byteNumbers = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      // Déclencher le téléchargement
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename || `ticket_${codeUnique}.pdf`
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)

      toast.success('🎉 Ticket téléchargé !')

    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Erreur lors du téléchargement.')
    } finally {
      setDownloading(null)
    }
  }

  // Étape 4 — Télécharger Image
  const telechargerImage = () => {
    setDownloadingImg(true)
    setTicketToExport(ticket)
  }

  useEffect(() => {
    if (ticketToExport) {
      setTimeout(async () => {
        try {
          const element = document.getElementById('ticket-export-container')
          if (!element) return
          
          const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
          })

          const image = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = image
          a.download = `ticket_${ticketToExport.code_unique}.png`
          a.click()
          
          toast.success('🎉 Image du ticket générée avec succès !')
        } catch (err) {
          console.error(err)
          toast.error("Erreur lors de la génération de l'image.")
        } finally {
          setDownloadingImg(false)
          setTicketToExport(null)
        }
      }, 100)
    }
  }, [ticketToExport])

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 10, padding: '12px 16px',
    width: '100%', fontSize: 14, outline: 'none',
  }

  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16, padding: '24px',
    maxWidth: 480, margin: '0 auto',
    boxShadow: 'var(--shadow-sm)',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Back */}
        <Link to={`/evenements/${id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <i className="bi bi-arrow-left" /> Retour à l'événement
        </Link>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i <= step ? 'var(--brand-color)' : 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
                border: i <= step ? 'none' : '1px solid var(--border)',
              }}>
                {i < step ? <i className="bi bi-check-lg" /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: i === step ? '#0D6EFD' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400, marginLeft: 6, marginRight: 6 }}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{ width: 30, height: 2, backgroundColor: i < step ? 'var(--brand-color)' : 'var(--border)', marginRight: 6 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Étape 0 — Infos participant ── */}
        {step === 0 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 16, gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Vos informations
              </h2>
              {loggedInMode && (
                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  Achat rapide connecté
                </span>
              )}
            </div>

            {loggedInMode && (
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-glow)', display: 'grid', placeItems: 'center', color: 'var(--brand-color)', fontSize: 18 }}>
                    <i className="bi bi-person-check-fill" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Les informations sont prises depuis votre compte participant. Vous pouvez finaliser votre réservation sans ressaisir vos données.
                </div>
              </div>
            )}

            {ev && categorie && (
              <div style={{ background: 'var(--brand-glow)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-color)' }}>{ev.titre}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  {categorie.nom} — {Number(categorie.prix).toLocaleString()} FCFA
                </div>
              </div>
            )}

            <form onSubmit={reserver}>
              {!loggedInMode && [
                { label: 'Nom complet', name: 'nom', icon: 'bi-person', type: 'text', required: true },
                { label: 'Email', name: 'email', icon: 'bi-envelope', type: 'email', required: true },
                { label: 'Téléphone', name: 'telephone', icon: 'bi-telephone', type: 'tel', required: false },
              ].map((f) => (
                <div key={f.name} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    {f.label} {f.required && <span style={{ color: '#DC3545' }}>*</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className={`bi ${f.icon}`} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handle}
                      required={f.required} style={{ ...inputStyle, paddingLeft: 42 }} />
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading} className="btn-submit btn-submit-primary">
                {loading ? (
                  <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Réservation…</>
                ) : (
                  <><i className="bi bi-arrow-right-circle" /> {loggedInMode ? 'Réserver avec mon compte' : 'Continuer vers le paiement'}</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Étape 1 — Paiement ── */}
        {step === 1 && ticket && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Confirmation de réservation
            </h2>

            {/* Récapitulatif */}
            <div style={{ backgroundColor: 'var(--bg-input)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Récapitulatif</h3>
              {[
                ['Événement', ticket.evenement?.titre],
                ['Catégorie', ticket.categorie?.nom],
                ['Prix', ticket.categorie?.prix ? `${Number(ticket.categorie.prix).toLocaleString()} FCFA` : 'Gratuit'],
                ['Participant', ticket.participant?.nom],
                ['Email', ticket.participant?.email],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: ticket.prix_paye == 0 ? 'var(--success)' : 'var(--brand-color)' }}>
                  {ticket.prix_paye == 0 ? ' GRATUIT' : `${Number(ticket.prix_paye).toLocaleString()} FCFA`}
                </span>
              </div>
            </div>

            {/* Méthode paiement simulée */}
            <div style={{ background: 'rgba(25,135,84,0.1)', border: '1px solid rgba(25,135,84,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#198754', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-shield-check" style={{ fontSize: 18 }} />
              Paiement sécurisé — Mode simulation activé
            </div>

            <button onClick={confirmerPaiement} disabled={loading} className="btn-submit btn-submit-primary">
              {loading
                ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Traitement…</>
                : ticket.prix_paye == 0
                  ? <><i className="bi bi-gift" /> Obtenir mon ticket gratuit</>
                  : <><i className="bi bi-credit-card" /> Confirmer le paiement</>
              }
            </button>
          </div>
        )}

        {/* ── Étape 2 — Succès + Téléchargement ── */}
        {step === 2 && ticket && (
          <div style={{ maxWidth: 360, margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

            {/* TICKET CONTAINER */}
            <div ref={ticketRef} style={{
              background: isDark ? '#1e2130' : '#fff',
              borderRadius: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              position: 'relative',
              marginBottom: 24
            }}>

              {/* TOP SECTION: Event Info */}
              <div style={{
                background: 'var(--gradient-brand)',
                padding: '16px 16px 24px',
                textAlign: 'center', color: '#fff',
                position: 'relative',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px', fontSize: 20,
                  boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                }}>
                  <i className="bi bi-check-lg" />
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#fff' }}>
                  Paiement confirmé !
                </h2>
                <p style={{ fontSize: 11, opacity: 0.9, margin: 0 }}>
                  Email: <strong>{ticket.participant?.email}</strong>
                </p>
              </div>

              {/* PERFORATION LINE */}
              <div style={{
                height: 0,
                borderTop: '2px dashed rgba(0,0,0,0.1)',
                margin: '0 20px',
                position: 'relative',
                zIndex: 2,
              }}>
                <div style={{
                  position: 'absolute', top: -12, left: -32,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--bg-body)',
                  boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.05)'
                }} />
                <div style={{
                  position: 'absolute', top: -12, right: -32,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--bg-body)',
                  boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.05)'
                }} />
              </div>

              {/* BOTTOM SECTION: Details & Code */}
              <div style={{ padding: '16px', background: isDark ? '#1e2130' : '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 2 }}>Événement</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ticket.evenement?.titre}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, background: isDark ? '#252839' : '#f8fafd', padding: '12px', borderRadius: 8 }}>
                  <div style={{ textAlign: 'center', borderRight: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Catégorie</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ticket.categorie?.nom}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Montant</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{Number(ticket.prix_paye).toLocaleString()} FCFA</div>
                  </div>
                </div>

                {/* Code unique stylisé (Barcode-like) */}
                <div style={{ textAlign: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Code Ticket Unique</div>
                  <div style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: 16, fontWeight: 900, color: 'var(--brand-color)',
                    letterSpacing: 2, padding: '8px',
                    background: 'rgba(13,110,253,0.05)', borderRadius: 8,
                    border: '1px dashed rgba(13,110,253,0.3)',
                    wordBreak: 'break-all'
                  }}>
                    {ticket.code_unique}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <button
                onClick={() => telechargerPDF(ticket.id, ticket.code_unique)}
                disabled={downloading || downloadingImg}
                className="btn-submit btn-submit-primary"
                style={{ flex: 1, padding: '12px 0', fontSize: 13 }}
              >
                {downloading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> ...</>
                ) : (
                  <><i className="bi bi-file-pdf" /> PDF</>
                )}
              </button>

              <button
                onClick={telechargerImage}
                disabled={downloading || downloadingImg}
                className="btn-submit"
                style={{ flex: 1, padding: '12px 0', fontSize: 13, background: downloadingImg ? '#6c757d' : 'linear-gradient(135deg, #0D6EFD, #E83E8C)', color: '#fff', border: 'none' }}
              >
                {downloadingImg ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> ...</>
                ) : (
                  <><i className="bi bi-image" /> Image</>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/" style={{
                  flex: 1, padding: '12px', textAlign: 'center',
                  border: '1px solid var(--border)', borderRadius: 10,
                  color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: 14,
                }}>
                  Retour accueil
                </Link>
                <Link to="/mes-tickets" style={{
                  flex: 1, padding: '12px', textAlign: 'center',
                  background: 'var(--brand-glow)', border: '1px solid transparent', borderRadius: 10,
                  color: 'var(--brand-color)', textDecoration: 'none', fontWeight: 600, fontSize: 14,
                }}>
                  Mes tickets
                </Link>
              </div>
          </div>
        )}
      </div>
      {/* Hidden container for true image generation */}
      <TicketExportCard ticket={ticketToExport} />
    </div>
  )
}
