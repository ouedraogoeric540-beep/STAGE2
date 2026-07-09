import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '../../api/axios';

const getCategoryColor = (catName) => {
  if (!catName) return '#3b82f6';
  const n = catName.toLowerCase();
  if (n.includes('gratuit')) return '#10b981';
  if (n.includes('vip')) return '#8b5cf6';
  if (n.includes('premium')) return '#f59e0b';
  return '#3b82f6';
};

const getStatusColor = (status) => {
  if (status === 'valide') return { bg: '#dcfce7', text: '#166534' };
  if (status === 'utilise') return { bg: '#fef9c3', text: '#854d0e' };
  if (status === 'expire') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#f1f5f9', text: '#475569' };
};

// Icônes SVG en ligne
const IconDate = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconTime = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconLocation = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconUser = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconOrg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const IconPrice = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

export default function TicketExportCard({ ticket }) {
  if (!ticket) return null;

  const bgStyle = ticket.evenement?.image 
    ? `linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)), url(${getImageUrl(ticket.evenement.image)}) center/cover`
    : '#0f172a';

  const catColor = getCategoryColor(ticket.categorie?.nom);
  const statusColor = getStatusColor(ticket.statut);
  
  const formattedDate = new Date(ticket.evenement?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = new Date(ticket.evenement?.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const purchaseDate = new Date(ticket.created_at || new Date()).toLocaleDateString('fr-FR');
  const orgName = ticket.evenement?.organisateur?.prenom 
    ? `${ticket.evenement.organisateur.prenom} ${ticket.evenement.organisateur.name}`
    : (ticket.evenement?.organisateur?.name || 'SecurePass');

  return (
    <div
      id="ticket-export-container"
      style={{
        position: 'fixed', left: '-9999px', top: 0,
        width: '750px', height: '310px',
        padding: '20px', // Extra padding for the shadow in the downloaded image
        background: 'transparent',
        zIndex: -9999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <table 
        width="100%" 
        height="100%" 
        cellPadding="0" 
        cellSpacing="0" 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          borderCollapse: 'collapse',
          border: '1px solid #cbd5e1'
        }}
      >
        <tbody>
          <tr>
            {/* LEFT SIDE: EVENT DETAILS */}
            <td 
              width="70%" 
              style={{
                background: bgStyle,
                color: '#ffffff',
                padding: '20px 25px',
                position: 'relative',
                verticalAlign: 'top'
              }}
            >
              {/* WATERMARK */}
              <div style={{
                position: 'absolute', top: '50px', left: '-20px',
                fontSize: '90px', fontWeight: 900, color: 'rgba(255,255,255,0.03)',
                transform: 'rotate(-10deg)', pointerEvents: 'none', whiteSpace: 'nowrap',
                letterSpacing: '10px'
              }}>
                SECUREPASS
              </div>

              {/* BRANDING */}
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', letterSpacing: '3px' }}>SECUREPASS</span>
              </div>

              {/* EVENT TITLE */}
              <div style={{ 
                fontSize: '28px', fontWeight: 800, lineHeight: 1.1, 
                marginBottom: '8px', maxWidth: '90%',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {ticket.evenement?.titre}
              </div>

              {/* BADGE */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ 
                  display: 'inline-block', background: catColor, color: '#fff', 
                  padding: '4px 10px', borderRadius: '4px', fontSize: '11px', 
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' 
                }}>
                  {ticket.categorie?.nom}
                </span>
              </div>

              {/* DETAILS GRID */}
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: 'auto', color: '#cbd5e1' }}>
                <tbody>
                  <tr>
                    <td width="50%" style={{ paddingBottom: '15px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        <IconDate /> Date & Heure
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                        {formattedDate} <span style={{ opacity: 0.7, fontSize: '14px', marginLeft: '4px' }}><IconTime /> {formattedTime}</span>
                      </div>
                    </td>
                    <td width="50%" style={{ paddingBottom: '15px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        <IconLocation /> Lieu
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                        {ticket.evenement?.lieu}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style={{ verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        <IconUser /> Participant
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>{ticket.participant?.nom}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{ticket.participant?.email}</div>
                    </td>
                    <td width="50%" style={{ verticalAlign: 'top' }}>
                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td width="50%">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                <IconOrg /> Organisateur
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{orgName}</div>
                            </td>
                            <td width="50%">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                <IconPrice /> Prix
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: ticket.prix_paye == 0 ? '#10b981' : '#ffffff' }}>
                                {ticket.prix_paye == 0 ? 'Gratuit' : `${Number(ticket.prix_paye).toLocaleString()} FCFA`}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

            </td>

            {/* SEPARATOR */}
            <td width="2" style={{ background: bgStyle, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '2px', borderLeft: '2px dashed rgba(255,255,255,0.4)', zIndex: 10 }}></div>
              {/* Cutouts */}
              <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', zIndex: 20 }}></div>
              <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', zIndex: 20 }}></div>
            </td>

            {/* RIGHT SIDE: CONTROL */}
            <td 
              width="30%" 
              style={{
                background: '#ffffff',
                padding: '15px',
                textAlign: 'center',
                verticalAlign: 'middle',
                position: 'relative'
              }}
            >
              {/* Status Badge */}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ 
                  display: 'inline-block', background: statusColor.bg, color: statusColor.text, 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', 
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' 
                }}>
                  {ticket.statut === 'valide' ? 'Billet Valide' : ticket.statut === 'utilise' ? 'Billet Utilisé' : 'Billet Expiré'}
                </span>
              </div>

              {/* QR Code */}
              <div style={{ display: 'inline-block', padding: '8px', border: '2px solid #e2e8f0', borderRadius: '12px', marginBottom: '8px' }}>
                <QRCodeSVG value={ticket.code_unique} size={120} level="H" />
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>SCANNER À L'ENTRÉE</div>
              <div style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '2px' }}>
                {ticket.code_unique}
              </div>

              {/* Footer info */}
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '8px', fontSize: '8.5px', color: '#94a3b8', lineHeight: 1.3, textAlign: 'center' }}>
                Achat: {purchaseDate} | Réf: {ticket.paiement?.reference || 'N/A'}<br/>
                Billet strictement nominatif et non remboursable.
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
