import React from 'react'

export default function Badge({
  children,
  variant = 'primary',
  icon,
  className = '',
  style = {}
}) {
  const variantStyles = {
    primary: {
      background: 'var(--brand-glow)',
      color: 'var(--brand-color)',
      border: '1px solid var(--brand-glow)'
    },
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: 'var(--success)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: 'var(--warning)',
      border: '1px solid rgba(245, 158, 11, 0.2)'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'var(--danger)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    info: {
      background: 'rgba(6, 182, 212, 0.1)',
      color: 'var(--info)',
      border: '1px solid rgba(6, 182, 212, 0.2)'
    },
    secondary: {
      background: 'rgba(100, 116, 139, 0.1)',
      color: 'var(--text-secondary)',
      border: '1px solid rgba(100, 116, 139, 0.2)'
    }
  }

  return (
    <span
      className={`ui-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-body)',
        ...variantStyles[variant],
        ...style
      }}
    >
      {icon && <i className={`bi ${icon}`} />}
      {children}
    </span>
  )
}
