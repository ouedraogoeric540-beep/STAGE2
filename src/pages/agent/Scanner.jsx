import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'
import AlerteModal from '../../components/common/AlerteModal'
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
      fps: 15, qrbox: { width: 260, height: 260 }, aspectRatio: 1,
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
      <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Lueur d'arrière-plan dynamique en fonction du statut */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120vw', height: '120vw',
          background: `radial-gradient(circle, ${cfg.bg}40 0%, transparent 60%)`,
          filter: 'blur(60px)', zIndex: 0,
          animation: 'pulseGlow 3s ease-in-out infinite alternate'
        }} />

        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))',
          padding: '40px 30px',
          borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.bg}40 inset`,
          backdropFilter: 'blur(20px)',
          width: '100%', maxWidth: 420,
          position: 'relative', zIndex: 1,
          animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Cercle d'icône avec pulsations */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: cfg.bg, borderRadius: '50%',
              opacity: 0.2, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <div style={{
              position: 'relative', width: '100%', height: '100%',
              background: `linear-gradient(135deg, ${cfg.bg}, #000)`,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 10px 25px ${cfg.bg}60`,
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <i className={`bi ${cfg.icon}`} style={{ fontSize: 48, color: '#fff', animation: 'bounceIn 0.8s' }} />
            </div>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: -0.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {cfg.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 32, fontWeight: 500 }}>
            {cfg.sub}
          </p>

          {resultat.ticket && (
            <div style={{
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: 20,
              padding: '24px', 
              marginBottom: 32, 
              textAlign: 'left',
              border: '1px dashed rgba(255,255,255,0.2)',
              position: 'relative'
            }}>
              {/* Encoches de ticket */}
              <div style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#0f172a', boxShadow: 'inset -1px 0 rgba(255,255,255,0.2)' }} />
              <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: '#0f172a', boxShadow: 'inset 1px 0 rgba(255,255,255,0.2)' }} />

              <div style={{ marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Titulaire du Pass</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{resultat.ticket.participant?.nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Catégorie</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{resultat.ticket.categorie?.nom || 'Standard'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <i className="bi bi-check-decagram" style={{ fontSize: 28, color: cfg.bg }} />
                </div>
              </div>
            </div>
          )}

          <button onClick={() => { reset(); setScanning(true); }} style={{
            width: '100%', padding: '18px', 
            background: cfg.bg, color: '#fff',
            border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800,
            cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: `0 8px 25px ${cfg.bg}40`,
            textTransform: 'uppercase', letterSpacing: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {cfg.btnLabel}
          </button>
        </div>

        <style>{`
          @keyframes pulseGlow {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
          }
          @keyframes slideUpFade {
            0% { transform: translateY(40px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </div>
    )
  }

  // ── Écran scanner principal ──
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={() => navigate('/agent')}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
            color: '#fff', padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <i className="bi bi-arrow-left" /> Quitter
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {evenementInfo?.titre || 'Sélectionner un événement'}
          </div>
          {evenementInfo && (
            <span style={{
              background: isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', 
              border: `1px solid ${isOnline ? '#10b981' : '#f59e0b'}`,
              borderRadius: 20, padding: '2px 10px', fontSize: 10, 
              color: isOnline ? '#10b981' : '#f59e0b', fontWeight: 600,
            }}>
              {isOnline ? 'Porte Connectée' : 'Mode Hors-Ligne'}
            </span>
          )}
          {syncStatus && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{syncStatus}</div>}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => {
              if(!evenementId) { toast.error('Veuillez sélectionner un événement d\'abord'); return; }
              setAlerteModalOpen(true);
            }} 
            style={{
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 8,
              color: '#ef4444', width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Signaler un problème d'urgence"
          >
            <i className="bi bi-exclamation-triangle-fill" />
          </button>
          
          <button onClick={() => navigate('/parametres')} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
            color: '#fff', width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="bi bi-gear" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* Sélection événement Premium */}
        {!evenementId && (
          <div style={{ marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff', textAlign: 'center' }}>
              <i className="bi bi-calendar-check" style={{ color: 'var(--brand-color)', marginRight: 8 }} />
              Sélectionnez l'événement
            </h3>
            <div style={{ display: 'grid', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
              {evenements.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setEvenementId(ev.id)}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: '16px',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = 'var(--brand-color)'
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(16,185,129,0.15), rgba(0,0,0,0.2))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, marginBottom: 4 }}>{ev.titre}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 12 }}>
                      <span><i className="bi bi-calendar3" /> {new Date(ev.date).toLocaleDateString()}</span>
                      <span><i className="bi bi-geo-alt" /> {ev.lieu}</span>
                    </div>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-color)'
                  }}>
                    <i className="bi bi-chevron-right" style={{ fontSize: 18, fontWeight: 900 }} />
                  </div>
                </div>
              ))}
              {evenements.length === 0 && (
                <div style={{ textAlign: 'center', padding: 30, color: 'rgba(255,255,255,0.5)' }}>
                  <i className="bi bi-inbox" style={{ fontSize: 40, marginBottom: 10, display: 'block' }} />
                  Aucun événement ne vous est assigné.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Zone scanner avec effet Glassmorphism et Néon */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(0,0,0,0.9))',
          borderRadius: 24,
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 0 40px rgba(16,185,129,0.1) inset, 0 10px 30px rgba(0,0,0,0.5)',
          height: 360, position: 'relative',
          marginBottom: 24, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Coins scanner animés (Néon) */}
          {['tl','tr','bl','br'].map((pos) => (
            <div key={pos} style={{
              position: 'absolute',
              top: pos.includes('t') ? 20 : 'auto',
              bottom: pos.includes('b') ? 20 : 'auto',
              left: pos.includes('l') ? 20 : 'auto',
              right: pos.includes('r') ? 20 : 'auto',
              width: 34, height: 34,
              borderColor: 'var(--brand-color)',
              borderStyle: 'solid', borderWidth: 0,
              filter: 'drop-shadow(0 0 8px var(--brand-color))',
              zIndex: 20,
              transition: 'all 0.3s ease',
              ...(pos === 'tl' ? { borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 } : {}),
              ...(pos === 'tr' ? { borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 } : {}),
              ...(pos === 'bl' ? { borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 } : {}),
              ...(pos === 'br' ? { borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 } : {}),
            }} />
          ))}

          {scanning ? (
            <div id="reader" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <i className="bi bi-qr-code-scan" style={{ fontSize: 40, display: 'block', marginBottom: 10 }} />
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                {loading ? 'Vérification en cours...' : 'Le viseur cherche automatiquement une combinaison de pass SPS-…'}
              </div>
            </div>
          )}

          {/* Ligne scan animée futuriste */}
          {scanning && (
            <div style={{
              position: 'absolute', left: 24, right: 24, height: 3,
              background: 'linear-gradient(90deg, transparent, var(--brand-color), transparent)',
              boxShadow: '0 0 15px var(--brand-color)',
              animation: 'scanLine 2.5s ease-in-out infinite',
              zIndex: 15
            }} />
          )}
        </div>

        {/* Ligne scan CSS et overrides du scanner par défaut */}
        <style>{`
          @keyframes scanLine {
            0%   { top: 20px; opacity: 0; }
            10%  { opacity: 1; }
            50%  { top: calc(100% - 24px); }
            90%  { opacity: 1; }
            100% { top: 20px; opacity: 0; }
          }
          /* Nettoyage de l'UI moche par défaut de la librairie */
          #reader {
            border: none !important;
          }
          #reader a {
            display: none !important; /* Cache 'Scan an Image File' */
          }
          #reader button {
            background: var(--brand-color) !important;
            color: #fff !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 10px !important;
            font-weight: 700 !important;
            margin-top: 10px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
          }
          #reader button:hover {
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5) !important;
            transform: translateY(-2px) !important;
          }
          #reader select {
            background: #1e293b !important;
            color: white !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            padding: 8px 12px !important;
            border-radius: 8px !important;
            margin-bottom: 12px !important;
            font-family: inherit !important;
          }
        `}</style>

        {/* Saisie manuelle */}
        <form onSubmit={submitManuel} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className="bi bi-keyboard" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Clé unique de hachage"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, color: '#fff',
                padding: '14px 14px 14px 46px', fontSize: 14,
                letterSpacing: 1, fontFamily: 'monospace',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                outline: 'none', transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand-color)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--brand-color), #059669)', border: 'none',
              borderRadius: 14, color: '#fff',
              padding: '0 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Vérifier
          </button>
        </form>

        {/* Bouton démarrer/arrêter */}
        <button
          onClick={scanning ? () => { try { scannerRef.current?.clear() } catch(_){} setScanning(false) } : demarrerScan}
          style={{
            width: '100%', padding: '14px',
            background: scanning ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: scanning ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
            borderRadius: 14, color: scanning ? '#ef4444' : '#10b981',
            fontWeight: 800, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.3s',
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = scanning ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = scanning ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <i className={`bi ${scanning ? 'bi-stop-circle' : 'bi-camera'} ${scanning ? 'pulse-icon' : ''}`} style={{ fontSize: 18 }} />
          {scanning ? 'Arrêter le scan' : 'Démarrer la caméra'}
        </button>

        <style>{`
          @keyframes pulseIcon {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .pulse-icon { animation: pulseIcon 2s infinite; }
        `}</style>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            borderRadius: 16, padding: '20px 16px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative', overflow: 'hidden'
          }}>
            <i className="bi bi-qr-code" style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, color: 'rgba(255,255,255,0.03)' }} />
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', textShadow: '0 2px 10px rgba(255,255,255,0.2)', marginBottom: 4 }}>
              {mesScans}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Mes Scans
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            borderRadius: 16, padding: '20px 16px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative', overflow: 'hidden'
          }}>
            <i className="bi bi-people-fill" style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, color: 'rgba(255,255,255,0.03)' }} />
            <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', textShadow: '0 2px 10px rgba(16,185,129,0.2)', marginBottom: 4 }}>
              {totalEntrees.utilises} <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/ {totalEntrees.total}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Entrées
            </div>
          </div>
        </div>

      </div>

      <AlerteModal 
        isOpen={alerteModalOpen} 
        onClose={() => setAlerteModalOpen(false)} 
        evenementId={evenementId} 
      />
    </div>
  )
}