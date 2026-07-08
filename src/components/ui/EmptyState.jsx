import React from 'react'

export default function EmptyState({
  icon = 'bi-inbox',
  title = 'Aucune donnée',
  description = 'Il n\'y a rien à afficher pour le moment.',
  action,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`ui-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px dashed var(--border-hover)',
        borderRadius: 'var(--radius-xl)',
        ...style
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          color: 'var(--text-muted)'
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 32 }} />
      </div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 24px 0', fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
