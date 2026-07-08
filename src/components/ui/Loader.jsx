import React from 'react'

export default function Loader({ size = 24, color = 'var(--brand-color)', borderWidth = 3, className = '', style = {} }) {
  return (
    <div
      className={`ui-loader ${className}`}
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid ${color}40`, // Transparent version of color
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        ...style
      }}
    />
  )
}
