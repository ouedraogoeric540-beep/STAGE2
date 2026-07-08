import React, { useState } from 'react'

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  style = {}
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setIsVisible(false)
  }

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
  }

  const arrowStyles = {
    top: { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
    bottom: { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' },
    left: { right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' },
    right: { left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
  }

  return (
    <div
      className={`ui-tooltip-container ${className}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            padding: '6px 12px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg-card)',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease',
            pointerEvents: 'none',
            ...positionStyles[position]
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              backgroundColor: 'var(--text-primary)',
              ...arrowStyles[position]
            }}
          />
        </div>
      )}
    </div>
  )
}
