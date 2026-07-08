import React from 'react'

export default function Radio({
  checked,
  onChange,
  label,
  name,
  value,
  disabled = false,
  className = '',
  style = {}
}) {
  return (
    <label
      className={`ui-radio ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
    >
      <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
        <input
          type="radio"
          name={name}
          value={value}
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
            borderRadius: '50%',
            transition: 'var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: checked ? 'var(--shadow-brand)' : 'inset 0 2px 4px rgba(0,0,0,0.01)'
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#fff',
              opacity: checked ? 1 : 0,
              transform: checked ? 'scale(1)' : 'scale(0.5)',
              transition: 'var(--transition-fast)'
            }}
          />
        </div>
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  )
}
