import React from 'react';

export default function StatCard({ card, index, hasLink = false }) {
  return (
    <div style={{
      backgroundColor: card.color,
      borderRadius: 8,
      position: 'relative',
      overflow: 'hidden',
      color: card.textColor,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      animation: `fadeIn 0.4s ease ${(index || 0) * 0.08}s both`,
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
        <div className="stat-value" style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: 1.2 }}>{card.value}</div>
        <div className="stat-label" style={{ fontSize: '15px', marginTop: 5 }}>{card.label}</div>
      </div>
      
      <i className={`bi ${card.icon} stat-icon`} style={{
        position: 'absolute',
        top: 10,
        right: 15,
        fontSize: '70px',
        color: card.textColor === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)', 
        zIndex: 0,
        transition: 'transform 0.3s ease',
      }} />
      
      {hasLink && (
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.1)',
          padding: '6px 0',
          textAlign: 'center',
          fontSize: '13px',
          zIndex: 1,
          cursor: 'pointer',
          color: card.textColor
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)' }}
        >
          Plus d'infos <i className="bi bi-arrow-right-circle" style={{ marginLeft: 4 }} />
        </div>
      )}
    </div>
  );
}
