import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'
import AlerteModal from '../../components/common/AlerteModal'
import ThemeToggle from '../../components/common/ThemeToggle'
import { useSync } from '../../hooks/useSync'
import { saveTickets, getTicketByQR, updateTicketLocalStatus, saveOfflineScan } from '../../utils/db'

export default function AgentScanner() {
  const { isDark }  = useTheme()
  const { state }   = useLocation()
  const navigate    = useNavigate()

  const [evenements, setEvenements]   = useState([])
  const [evenementId, setEvenementId] = useState(state?.evenementId || '')
  const [evenementInfo, setEvenementInfo] = useState(null)
  const [scanning, setScanning]       = useState(false)
  const [resultat, setResultat]       = useState(null)
  const [manualCode, setManualCode]   = useState('')
  const [loading, setLoading]         = useState(false)
  const [mesScans, setMesScans]       = useState(0)
  const [totalEntrees, setTotalEntrees] = useState({ utilises: 0, total: 0 })
  const [alerteModalOpen, setAlerteModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')

  const { isOnline, isSyncing, syncData } = useSync()
  const scannerRef = useRef(null)

  useEffect(() => {
    api.get('/agent/evenements').then((r) => {
      setEvenements(r.data)
      if (state?.evenementId) {
        const ev = r.data.find((e) => e.id == state.evenementId)
        if (ev) setEvenementInfo(ev)
      }
    })
    api.get('/scans/historique').then((r) => setMesScans(r.data.total || r.data.data?.length || 0))
  }, [])

  useEffect(() => {
    if (evenementId) {
      const ev = evenements.find((e) => e.id == evenementId)
      if (ev) {
        setTimeout(() => {
          setEvenementInfo(ev)
          const vendus = ev.categories?.reduce((s, c) => s + c.quantite_vendue, 0) || 0
          const total  = ev.capacite_max || 0
          setTotalEntrees({ utilises: vendus, total })
        }, 0)
      }
      
      // Télécharger les hashs pour le mode offline
      if (isOnline) {
        setSyncStatus('Téléchargement base locale...')
        api.get(`/evenements/${evenementId}/tickets-hashes`)
          .then(async (res) => {
            await saveTickets(res.data)
            setSyncStatus('Base locale prête')
            setTimeout(() => setSyncStatus(''), 3000)
          })
          .catch(err => {
            console.error(err)
            setSyncStatus('Erreur synchro locale')
          })
      }

      // Démarrage automatique du scanner si l'événement est sélectionné
      if (!scanning && !resultat) {
        setScanning(true)
      }
    }
  }, [evenementId, evenements, isOnline])

  const traiterResultatScan = (data) => {
    setResultat(data)
    setMesScans((p) => p + 1)
    if (navigator.vibrate) {
      navigator.vibrate(data.resultat === 'valide' ? [100] : [100, 50, 100, 50, 100])
    }
  }

  const envoyerScan = async (qrCode) => {
    if (!evenementId) { toast.error('Sélectionnez un événement'); return }
    setLoading(true)

    try {
      if (isOnline) {
        // En ligne : appel classique à l'API
        const res = await api.post('/scan', { qr_code: qrCode, evenement_id: evenementId })
        traiterResultatScan(res.data)
      } else {
        // Hors ligne : vérification locale
        const ticket = await getTicketByQR(qrCode)
        
        let resultatFinal = 'invalide'
        let messageFinal = 'QR Code invalide ou introuvable.'
        let mockTicket = null

        if (ticket) {
          mockTicket = { participant: { nom: 'Participant (Offline)' }, categorie: { nom: 'Standard' } } // Données minimales car non stockées intégralement
          
          if (ticket.statut === 'utilise') {
            resultatFinal = 'deja_utilise'
            messageFinal = 'Ce ticket a déjà été utilisé.'
          } else if (ticket.statut === 'expire') {
            resultatFinal = 'invalide'
            messageFinal = 'Ce ticket est expiré.'
          } else if (ticket.statut === 'valide') {
            resultatFinal = 'valide'
            messageFinal = 'Accès autorisé. Bienvenue !'
            // Mettre à jour localement
            await updateTicketLocalStatus(qrCode, 'utilise')
          }
        }

        const scanData = {
          resultat: resultatFinal,
          message: messageFinal,
          ticket: mockTicket
        }

        traiterResultatScan(scanData)

        // Sauvegarder pour la synchronisation future
        await saveOfflineScan({
          qr_code: qrCode,
          evenement_id: evenementId,
          resultat: resultatFinal,
          date_scan: new Date().toISOString()
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du scan')
    } finally { 
      setLoading(false) 
    }
  }

  // Démarrer scanner
  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner('reader', {
      fps: 15, 
      qrbox: { width: 260, height: 260 }, 
      aspectRatio: 1,
      videoConstraints: {
        facingMode: "environment"
      }
    }, false)

    scanner.render(
      async (decodedText) => {
        scanner.clear()
        setScanning(false)
        await envoyerScan(decodedText)
      },
      () => {}
    )

    scannerRef.current = scanner
    return () => { try { scanner.clear() } catch (_) {} }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  const demarrerScan = () => {
    if (!evenementId) { toast.error('Sélectionnez un événement'); return }
    setResultat(null)
    setScanning(true)
  }

  const reset = () => {
    setResultat(null)
    setScanning(false)
    setManualCode('')
  }

  const submitManuel = async (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    await envoyerScan(manualCode.trim())
    setManualCode('')
  }

  // Config résultats
  const resultatConfig = {
    valide: {
      bg: '#10b981', title: 'ACCÈS AUTORISÉ',
      sub: 'Ticket vérifié avec succès',
      icon: 'bi-check-circle-fill', btnLabel: 'Ticket Suivant',
    },
    deja_utilise: {
      bg: '#f59e0b', title: 'DÉJÀ SCANNÉ',
      sub: 'Alerte : Risque de duplication / copie !',
      icon: 'bi-exclamation-triangle-fill', btnLabel: 'Refuser & Continuer',
    },
    invalide: {
      bg: '#ef4444', title: 'TICKET INVALIDE',
      sub: 'Ce code ne correspond à aucune donnée',
      icon: 'bi-x-circle-fill', btnLabel: 'Réessayer',
    },
    mauvais_evenement: {
      bg: '#ef4444', title: 'TICKET INVALIDE',
      sub: 'Ce ticket n\'appartient pas à cet événement',
      icon: 'bi-x-circle-fill', btnLabel: 'Réessayer',
    },
  }

  const cfg = resultat ? (resultatConfig[resultat.resultat] || resultatConfig.invalide) : null

  if (resultat && cfg) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-body)' }}>
        <div className="scanner-modal-content text-center p-4 p-md-5" style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 480 }}>
          <div className="mb-4">
             <i className={`bi ${cfg.icon}`} style={{ fontSize: 64, color: cfg.bg }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            {cfg.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, fontWeight: 500 }}>
            {cfg.sub}
          </p>

          {resultat.ticket && (
            <div className="text-start p-4 mb-4 rounded-4" style={{ background: 'var(--bg-surface)' }}>
              <div className="mb-3 border-bottom pb-3">
                <span className="d-block" style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Titulaire</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18 }}>{resultat.ticket.participant?.nom}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="d-block" style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Catégorie</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{resultat.ticket.categorie?.nom || 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => { reset(); setScanning(true); }} className="btn-soft w-100" style={{ background: cfg.bg, color: '#fff', fontSize: 16, padding: '16px' }}>
            {cfg.btnLabel}
          </button>
        </div>
      </div>
    )
  }

  // ── Écran scanner principal (Soft UI) ──
  return (
    <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: 40 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ backgroundColor: 'var(--bg-card)' }}>
        <button onClick={() => navigate('/agent')} className="btn-soft btn-soft-outline">
          <i className="bi bi-arrow-left" /> <span className="d-none d-sm-inline">Quitter</span>
        </button>

        <div className="text-center">
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {evenementInfo?.titre || 'Sélectionner un événement'}
          </div>
          {evenementInfo && (
            <span className={`badge-soft ${isOnline ? 'badge-soft-success' : 'badge-soft-warning'} mt-1`}>
              {isOnline ? 'En ligne' : 'Hors-ligne'}
            </span>
          )}
          {syncStatus && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{syncStatus}</div>}
        </div>

        <div className="d-flex align-items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => {
              if(!evenementId) { toast.error('Veuillez sélectionner un événement d\'abord'); return; }
              setAlerteModalOpen(true);
            }} 
            className="btn-soft btn-soft-outline" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '8px 12px' }}
          >
            <i className="bi bi-exclamation-triangle-fill" />
          </button>
          
          <button onClick={() => navigate('/parametres')} className="btn-soft btn-soft-outline">
            <i className="bi bi-gear" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>

        {!evenementId && (
          <div className="mb-4">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
              Sélectionnez l'événement
            </h3>
            <div className="d-flex flex-column gap-3">
              {evenements.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setEvenementId(ev.id)}
                  className="soft-card-row" style={{ cursor: 'pointer', marginBottom: 0 }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{ev.titre}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                      <span><i className="bi bi-calendar3" /> {new Date(ev.date).toLocaleDateString()}</span>
                      <span><i className="bi bi-geo-alt" /> {ev.lieu}</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--primary)' }}>
                    <i className="bi bi-chevron-right fs-5" />
                  </div>
                </div>
              ))}
              {evenements.length === 0 && (
                <div className="text-center p-5 text-muted">
                  Aucun événement assigné.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal-like Scanner UI (Image 1 replica) */}
        {evenementId && (
          <div className="scanner-modal-content" style={{ background: 'var(--bg-card)', padding: '24px 20px', margin: '20px 0' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>Scanner QR Code</h4>
              <button className="scanner-close-btn" onClick={() => { setEvenementId(null); setScanning(false); try { scannerRef.current?.clear() } catch(_) {} }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            
            <div className="mb-4">
              <strong className="d-block" style={{ fontSize: 15 }}>{evenementInfo?.titre}</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Positionnez le QR code devant votre caméra</span>
            </div>

            <div className="scanner-camera-container mb-4" style={{ minHeight: 320, position: 'relative', background: '#000' }}>
              {scanning ? (
                <div id="reader" style={{ width: '100%' }} />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white-50" style={{ minHeight: 320 }}>
                  <i className="bi bi-camera" style={{ fontSize: 40, marginBottom: 10 }} />
                  <span>Caméra inactive</span>
                </div>
              )}
            </div>

            <button
              onClick={scanning ? () => { try { scannerRef.current?.clear() } catch(_){} setScanning(false) } : demarrerScan}
              className={`btn-soft w-100 ${scanning ? 'btn-soft-outline' : 'btn-soft-primary'}`}
              style={scanning ? { borderColor: '#ef4444', color: '#ef4444', padding: '14px' } : { padding: '14px' }}
            >
              {scanning ? 'Annuler' : 'Démarrer la caméra'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="d-flex gap-3 mt-4">
          <div className="soft-card-row flex-fill text-center p-3 m-0" style={{ alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
              {mesScans}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
              Mes Scans
            </div>
          </div>
          <div className="soft-card-row flex-fill text-center p-3 m-0" style={{ alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--success)' }}>
              {totalEntrees.utilises} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {totalEntrees.total}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
              Total Entrées
            </div>
          </div>
        </div>

      </div>

      <style>{`
        /* Nettoyage Html5QrcodeScanner pour s'intégrer proprement */
        #reader { border: none !important; }
        #reader img { display: none !important; }
        #reader a { display: none !important; }
        #reader select {
          background: rgba(255,255,255,0.9) !important;
          border: none !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          margin-bottom: 12px !important;
          font-family: inherit !important;
        }
        #reader button {
          background: var(--primary) !important;
          color: #fff !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          margin-top: 10px !important;
        }
        #reader video {
          object-fit: cover !important;
          border-radius: 16px !important;
          max-height: 400px !important;
        }
      `}</style>

      <AlerteModal isOpen={alerteModalOpen} onClose={() => setAlerteModalOpen(false)} evenementId={evenementId} />
    </div>
  )
}