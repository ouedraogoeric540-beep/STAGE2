import React from 'react'

export default function Avatar({
  name = '',
  src,
  size = 'md',
  color = 'var(--brand-color)',
  style = {},
  className = ''
}) {
  const sizeMap = {
    sm: { width: 32, height: 32, fontSize: 13 },
    md: { width: 40, height: 40, fontSize: 16 },
    lg: { width: 56, height: 56, fontSize: 20 },
    xl: { width: 80, height: 80, fontSize: 28 },
  }

  const dim = sizeMap[size] || sizeMap.md

  const getInitial = (n) => {
    return n ? n.charAt(0).toUpperCase() : '?'
  }

  return (
    <div
      className={`ui-avatar ${className}`}
      style={{
        ...dim,
        borderRadius: '50%',
        backgroundColor: src ? 'transparent' : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        overflow: 'hidden',
        boxShadow: `0 4px 12px ${color}40`, // Soft shadow matching color
        flexShrink: 0,
        ...style
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        getInitial(name)
      )}
    </div>
  )
}
