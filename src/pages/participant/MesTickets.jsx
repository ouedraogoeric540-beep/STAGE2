import { useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import { QRCodeSVG } from 'qrcode.react'
import TicketExportCard from '../../components/common/TicketExportCard'
import StatCard from '../../components/common/StatCard'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api, { getImageUrl } from '../../api/axios'
import toast from 'react-hot-toast'

const statutConfig = {
  valide: { color: '#198754', bg: '#19875420', label: '✓ Valide' },
  utilise: { color: '#fd7e14', bg: '#fd7e1420', label: '✓ Utilisé' },
  expire: { color: '#DC3545', bg: '#DC354520', label: '✗ Expiré' },
}

export default function MesTickets() {

  const { isDark } = useTheme()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [downloadingImg, setDownloadingImg] = useState(null)
  const [ticketToExport, setTicketToExport] = useState(null)
  const [filterStatut, setFilterStatut] = useState('tous')
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    api.get('/tickets/mes-tickets')
      .then((r) => setTickets(r.data))
      .catch(() => toast.error('Erreur chargement des tickets'))
      .finally(() => setLoading(false))
  }, [])

  const telechargerPDF = async (ticketId, codeUnique) => {
    setDownloading(ticketId)
    try {
      const res = await api.get(`/tickets/${ticketId}/pdf`)
      const { base64, filename } = res.data

      const byteChars = atob(base64)
      const byteNumbers = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

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

      toast.success('Ticket téléchargé !')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Erreur lors du téléchargement.')
    } finally {
      setDownloading(null)
    }
  }

  const telechargerImage = (ticket) => {
    setDownloadingImg(ticket.id)
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
          setDownloadingImg(null)
          setTicketToExport(null)
        }
      }, 100)
    }
  }, [ticketToExport])

  const stats = {
    total: tickets.length,
    valides: tickets.filter((t) => t.statut === 'valide').length,
    utilises: tickets.filter((t) => t.statut === 'utilise').length,
    expires: tickets.filter((t) => t.statut === 'expire').length,
  }

  const statCards = [
    { label: 'Total tickets', value: stats.total, icon: 'bi-ticket-detailed-fill', color: '#0D6EFD', textColor: '#fff' },
    { label: 'Tickets valides', value: stats.valides, icon: 'bi-check-circle-fill', color: '#198754', textColor: '#fff' },
    { label: 'Tickets utilisés', value: stats.utilises, icon: 'bi-ticket-fill', color: '#ffc107', textColor: '#000' },
    { label: 'Tickets expirés', value: stats.expires, icon: 'bi-x-circle-fill', color: '#DC3545', textColor: '#fff' },
    { label: 'Événements', value: new Set(tickets.map(t => t.evenement_id)).size, icon: 'bi-calendar-event', color: '#fd7e14', textColor: '#fff' },
    { label: 'Total dépensé', value: `${tickets.reduce((sum, t) => sum + Number(t.prix_paye), 0).toLocaleString()} FCFA`, icon: 'bi-cash-coin', color: '#6f42c1', textColor: '#fff' },
  ]

  return (
    <Layout title="Mes Tickets">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 16, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <StatCard key={i} card={card} index={i} hasLink={true} />
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'tous', label: 'Tous les tickets', icon: 'bi-grid-fill' },
            { id: 'valide', label: 'Valides', icon: 'bi-check-circle-fill' },
            { id: 'utilise', label: 'Utilisés', icon: 'bi-ticket-fill' },
            { id: 'expire', label: 'Expirés', icon: 'bi-x-circle-fill' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilterStatut(f.id); setPage(1); }}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${filterStatut === f.id ? '#0D6EFD' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                backgroundColor: filterStatut === f.id ? 'var(--brand-color)' : (isDark ? '#1e2130' : '#ffffff'),
                color: filterStatut === f.id ? 'var(--brand-text)' : 'var(--text-primary)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <i className={`bi ${f.icon}`} /> {f.label}
            </button>
          ))}
        </div>

        {/* Liste tickets */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Chargement de vos tickets…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{
            backgroundColor: isDark ? '#1e2130' : '#fff',
            border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
            borderRadius: 16, padding: 80, textAlign: 'center',
          }}>
            <i className="bi bi-ticket-perforated" style={{ fontSize: 56, color: '#0D6EFD', display: 'block', marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Aucun ticket pour le moment</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Réservez votre place à un événement pour voir vos tickets ici
            </p>
            <a href="/" style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #0D6EFD, #E83E8C)',
              borderRadius: 10, color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <i className="bi bi-calendar-event" /> Voir les événements
            </a>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: isDark ? '#1e2130' : '#ffffff', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, color: 'var(--text-muted)' }}>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Événement</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Montant</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Statut</th>
                  <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredTickets = tickets.filter(t => filterStatut === 'tous' || t.statut === filterStatut)
                  const paginatedTickets = filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage)
                  return paginatedTickets.map((ticket, i) => {
                    const cfg = statutConfig[ticket.statut] || statutConfig.expire

                    return (
                      <tr
                        key={ticket.id}
                        style={{
                          borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          opacity: ticket.statut === 'utilise' ? 0.65 : 1,
                          animation: `fadeIn 0.5s ease ${i * 0.05}s both`,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#252839' : '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setSelected(ticket)}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{ticket.evenement?.titre}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><i className="bi bi-geo-alt" style={{ marginRight: 4 }} />{ticket.evenement?.lieu}</div>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                          {new Date(ticket.evenement?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 700, color: ticket.prix_paye == 0 ? '#198754' : 'var(--text-primary)' }}>
                          {ticket.prix_paye == 0 ? 'Gratuit' : `${Number(ticket.prix_paye).toLocaleString()} FCFA`}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelected(ticket) }}
                              className="btn-action btn-action-primary"
                            >
                              <i className="bi bi-eye" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                telechargerPDF(ticket.id, ticket.code_unique)
                              }}
                              disabled={downloading === ticket.id || downloadingImg === ticket.id}
                              className="btn-action btn-action-success"
                            >
                              {downloading === ticket.id
                                ? <span style={{ width: 14, height: 14, border: '2px solid rgba(25,135,84,0.3)', borderTopColor: '#198754', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : <i className="bi bi-file-pdf" />
                              }
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                telechargerImage(ticket)
                              }}
                              disabled={downloading === ticket.id || downloadingImg === ticket.id}
                              className="btn-action"
                              style={{ background: downloadingImg === ticket.id ? '#6c757d' : 'linear-gradient(135deg, #0D6EFD, #E83E8C)', color: '#fff' }}
                            >
                              {downloadingImg === ticket.id
                                ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                : <i className="bi bi-image" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>

            {/* Pagination Intelligente */}
            {(() => {
              const filteredTickets = tickets.filter(t => filterStatut === 'tous' || t.statut === filterStatut);
              const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
              if (totalPages <= 1) return null;

              return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '24px 20px', borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { if (page > 1) setPage(page - 1) }}
                    disabled={page === 1}
                    style={{
                      height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                      background: isDark ? '#1a1d2d' : '#fff', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => !page === 1 && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                    onMouseLeave={(e) => !page === 1 && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
                  >
                    <i className="bi bi-chevron-left" style={{ fontSize: 11 }} /> Précédent
                  </button>

                  {(() => {
                    let pages = [];
                    if (totalPages <= 7) {
                      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                    } else {
                      if (page <= 4) {
                        pages = [1, 2, 3, 4, 5, '...', totalPages];
                      } else if (page >= totalPages - 3) {
                        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                      } else {
                        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                      }
                    }

                    return pages.map((p, index) => (
                      p === '...' ? (
                        <span key={`dots-${index}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 2 }}>...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          style={{
                            width: 38, height: 38, borderRadius: 10, border: p === page ? 'none' : `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                            cursor: 'pointer', fontWeight: p === page ? 700 : 600, fontSize: 13,
                            background: p === page ? 'var(--brand-color, #0D6EFD)' : (isDark ? '#1a1d2d' : '#fff'),
                            color: p === page ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease',
                            boxShadow: p === page ? '0 4px 12px rgba(13, 110, 253, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                          onMouseEnter={(e) => p !== page && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                          onMouseLeave={(e) => p !== page && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
                        >
                          {p}
                        </button>
                      )
                    ))
                  })()}

                  <button
                    onClick={() => { if (page < totalPages) setPage(page + 1) }}
                    disabled={page === totalPages}
                    style={{
                      height: 38, padding: '0 16px', borderRadius: 10, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
                      background: isDark ? '#1a1d2d' : '#fff', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => !page === totalPages && (e.currentTarget.style.borderColor = 'var(--brand-color)')}
                    onMouseLeave={(e) => !page === totalPages && (e.currentTarget.style.borderColor = isDark ? '#2a2d3e' : '#e2e8f0')}
                  >
                    Suivant <i className="bi bi-chevron-right" style={{ fontSize: 11 }} />
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Modal Détail Ticket ── */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 2000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            id="ticket-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1e2130' : '#fff',
              borderRadius: 20, width: '100%', maxWidth: 460,
              border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
              overflow: 'hidden', animation: 'slideUp 0.3s ease',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {/* Event Image Header */}
            <div style={{
              height: 120,
              background: selected.evenement?.image
                ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${getImageUrl(selected.evenement.image)}) center/cover`
                : 'linear-gradient(135deg, var(--brand-color), #2563eb)',
              color: '#fff',
              padding: '24px',
              position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
            }}>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '4px 8px', fontSize: 14 }}>
                <i className="bi bi-x-lg" />
              </button>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Billet SecurePass</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{selected.evenement?.titre}</div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px' }}>

              {/* User Info & Category */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Participant</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.participant?.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selected.participant?.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Catégorie</div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(13,110,253,0.1)', color: '#0D6EFD', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {selected.categorie?.nom}
                  </span>
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderTop: `1px dashed ${isDark ? '#2a2d3e' : '#cbd5e1'}`, borderBottom: `1px dashed ${isDark ? '#2a2d3e' : '#cbd5e1'}`, marginBottom: 12, position: 'relative' }}>
                {/* Perforations */}
                <div style={{ position: 'absolute', top: -8, left: -24, width: 16, height: 16, borderRadius: '50%', background: isDark ? '#1a1d27' : '#f8f9fa' }} />
                <div style={{ position: 'absolute', top: -8, right: -24, width: 16, height: 16, borderRadius: '50%', background: isDark ? '#1a1d27' : '#f8f9fa' }} />
                <div style={{ position: 'absolute', bottom: -8, left: -24, width: 16, height: 16, borderRadius: '50%', background: isDark ? '#1a1d27' : '#f8f9fa' }} />
                <div style={{ position: 'absolute', bottom: -8, right: -24, width: 16, height: 16, borderRadius: '50%', background: isDark ? '#1a1d27' : '#f8f9fa' }} />

                <div style={{ background: '#fff', padding: 6, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <QRCodeSVG value={selected.code_unique} size={100} level="M" />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#0D6EFD', letterSpacing: 4, marginTop: 8 }}>
                  {selected.code_unique}
                </div>

                {/* Status Badge */}
                <div style={{ marginTop: 6 }}>
                  {(() => {
                    const cfg = statutConfig[selected.statut] || statutConfig.expire
                    return (
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Additional Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(selected.evenement?.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lieu</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.evenement?.lieu}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Montant Payé</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected.prix_paye == 0 ? '#198754' : 'var(--text-primary)' }}>
                    {selected.prix_paye == 0 ? 'Gratuit' : `${Number(selected.prix_paye).toLocaleString()} FCFA`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Référence</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.paiement?.reference || 'N/A'}</div>
                </div>
              </div>

              {/* Boutons télécharger */}
              <div id="ticket-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => telechargerPDF(selected.id, selected.code_unique)}
                  disabled={downloading === selected.id || downloadingImg === selected.id}
                  style={{
                    flex: 1, padding: '10px',
                    background: downloading === selected.id ? '#6c757d' : 'linear-gradient(135deg, #198754, #20c997)',
                    border: 'none', borderRadius: 10, color: '#fff',
                    fontWeight: 700, fontSize: 13,
                    cursor: (downloading === selected.id || downloadingImg === selected.id) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {downloading === selected.id
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> ...</>
                    : <><i className="bi bi-file-pdf" /> PDF</>
                  }
                </button>
                <button
                  onClick={() => telechargerImage(selected)}
                  disabled={downloading === selected.id || downloadingImg === selected.id}
                  style={{
                    flex: 1, padding: '10px',
                    background: downloadingImg === selected.id ? '#6c757d' : 'linear-gradient(135deg, #0D6EFD, #E83E8C)',
                    border: 'none', borderRadius: 10, color: '#fff',
                    fontWeight: 700, fontSize: 13,
                    cursor: (downloading === selected.id || downloadingImg === selected.id) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {downloadingImg === selected.id
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> ...</>
                    : <><i className="bi bi-image" /> Image</>
                  }
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hidden container for true image generation */}
      <TicketExportCard ticket={ticketToExport} />
    </Layout>
  )
}