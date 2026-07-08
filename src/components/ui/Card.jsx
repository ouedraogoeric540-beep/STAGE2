import React from 'react'

export default function Card({
  children,
  title,
  subtitle,
  icon,
  headerAction,
  noPadding = false,
  glass = false,
  className = '',
  style = {},
  onClick
}) {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`ui-card ${glass ? 'glass-panel' : ''} ${className}`}
      style={{
        backgroundColor: glass ? 'var(--glass-bg)' : 'var(--bg-card)',
        border: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition-normal)',
        cursor: isClickable ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          e.currentTarget.style.borderColor = 'var(--border-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.borderColor = glass ? 'var(--glass-border)' : 'var(--border)'
        }
      }}
    >
      {(title || headerAction) && (
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {icon && (
              <div style={{
                width: 40, height: 40,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)'
              }}>
                <i className={`bi ${icon}`} style={{ fontSize: 18 }} />
              </div>
            )}
            <div>
              {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{title}</h3>}
              {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div style={{ padding: noPadding ? 0 : '24px' }}>
        {children}
      </div>
    </div>
  )
}
