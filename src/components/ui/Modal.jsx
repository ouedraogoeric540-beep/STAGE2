import React from 'react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  glass = true
}) {
  if (!isOpen) return null

  const sizeStyles = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    full: '95%'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: sizeStyles[size],
          maxHeight: '90vh',
          backgroundColor: glass ? 'var(--glass-bg)' : 'var(--bg-card)',
          border: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
          backdropFilter: glass ? 'blur(16px)' : 'none',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              width: 36, height: 36,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--danger)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <i className="bi bi-x-lg" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
            background: glass ? 'rgba(0,0,0,0.02)' : 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
