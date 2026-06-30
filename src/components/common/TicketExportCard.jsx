import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getImageUrl } from '../../api/axios';

export default function TicketExportCard({ ticket }) {
  if (!ticket) return null;

  return (
    <div
      id="ticket-export-container"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '400px',
        background: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #cbd5e1',
        zIndex: -9999,
      }}
    >
      {/* Header */}
      <div style={{
        background: ticket.evenement?.image 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${getImageUrl(ticket.evenement.image)}) center/cover`
          : 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        color: '#ffffff',
        padding: '30px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          {ticket.evenement?.titre}
        </div>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.2)',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          marginTop: '10px'
        }}>
          {ticket.categorie?.nom}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '25px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Participant
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {ticket.participant?.nom}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {ticket.participant?.email}
          </div>
        </div>

        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
          <QRCodeSVG value={ticket.code_unique} size={150} level="H" />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Code unique
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '2px' }}>
            {ticket.code_unique}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Date</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {new Date(ticket.evenement?.date).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Lieu</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {ticket.evenement?.lieu}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
