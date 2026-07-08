import React, { forwardRef } from 'react'

const Textarea = forwardRef(({
  label,
  error,
  fullWidth = true,
  className = '',
  containerStyle = {},
  rows = 4,
  ...props
}, ref) => {
  
  const baseStyle = {
    width: fullWidth ? '100%' : 'auto',
    backgroundColor: 'var(--bg-input)',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    padding: `12px 16px`,
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    transition: 'var(--transition-fast)',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.01)',
    resize: 'vertical'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: fullWidth ? '100%' : 'auto', ...containerStyle }} className={className}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
      
      <div style={{ position: 'relative', width: '100%' }}>
        <textarea
          ref={ref}
          rows={rows}
          style={baseStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--brand-color)'
            e.currentTarget.style.boxShadow = `0 0 0 4px ${error ? 'rgba(239, 68, 68, 0.15)' : 'var(--brand-glow)'}`
            e.currentTarget.style.backgroundColor = 'var(--bg-card)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.01)'
            e.currentTarget.style.backgroundColor = 'var(--bg-input)'
          }}
          {...props}
        />
      </div>

      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 500, marginTop: '-4px' }}>{error}</span>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea
