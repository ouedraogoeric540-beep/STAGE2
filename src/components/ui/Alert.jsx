import React from 'react'

export default function Alert({
  children,
  title,
  variant = 'primary',
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  style = {}
}) {
  const variantStyles = {
    primary: {
      background: 'var(--brand-glow)',
      color: 'var(--brand-color)',
      borderColor: 'var(--brand-color)'
    },
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--success)',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: 'var(--warning)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--danger)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    info: {
      background: 'rgba(6, 182, 212, 0.1)',
      color: 'var(--info)',
      borderColor: 'rgba(6, 182, 212, 0.3)'
    }
  }

  const currentStyle = variantStyles[variant] || variantStyles.primary

  return (
    <div
      className={`ui-alert ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        background: currentStyle.background,
        borderLeft: `4px solid ${currentStyle.borderColor}`,
        color: currentStyle.color,
        position: 'relative',
        ...style
      }}
    >
      {icon && (
        <i className={`bi ${icon}`} style={{ fontSize: 20, marginTop: title ? 2 : 0 }} />
      )}
      <div style={{ flex: 1 }}>
        {title && <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: currentStyle.color, fontFamily: 'var(--font-heading)' }}>{title}</h4>}
        <div style={{ fontSize: 14, color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.5 }}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: currentStyle.color,
            opacity: 0.7,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        >
          <i className="bi bi-x-lg" style={{ fontSize: 14 }} />
        </button>
      )}
    </div>
  )
}
