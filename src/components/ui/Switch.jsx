import React from 'react'

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  style = {}
}) {
  return (
    <label
      className={`ui-switch ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      <div style={{ position: 'relative', width: 44, height: 24 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: checked ? 'var(--brand-color)' : 'var(--border-hover)',
            borderRadius: 'var(--radius-full)',
            transition: 'var(--transition-normal)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            backgroundColor: '#fff',
            borderRadius: '50%',
            transition: 'var(--transition-normal)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </div>
      {label && <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  )
}
