import React from 'react'

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  style = {}
}) {
  return (
    <label
      className={`ui-checkbox ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0, marginTop: 2 }}>
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
            backgroundColor: checked ? 'var(--brand-color)' : 'var(--bg-input)',
            border: `1.5px solid ${checked ? 'var(--brand-color)' : 'var(--border)'}`,
            borderRadius: '6px',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: checked ? 'var(--shadow-brand)' : 'inset 0 2px 4px rgba(0,0,0,0.01)'
          }}
        >
          <i
            className="bi bi-check"
            style={{
              color: '#fff',
              fontSize: 16,
              opacity: checked ? 1 : 0,
              transform: checked ? 'scale(1)' : 'scale(0.5)',
              transition: 'var(--transition-fast)'
            }}
          />
        </div>
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{label}</span>}
    </label>
  )
}
