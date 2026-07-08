import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'

export default function DashboardStatCard({ label, value, desc, icon, bg, textColor = '#fff', linkTo }) {
  const { isDark } = useTheme()
  const isDefaultBg = bg === 'var(--brand-color)' || bg === 'var(--primary)'

  // Use a glass effect or a solid modern background depending on theme and bg
  const actualBg = isDefaultBg 
    ? 'var(--gradient-brand)' 
    : bg.startsWith('#') && isDark ? `${bg}40` : bg

  const actualTextColor = isDefaultBg 
    ? '#fff' 
    : bg.startsWith('#') && isDark ? bg : textColor

  const cardContent = (
    <div
      className="stat-card"
      style={{
        background: actualBg,
        color: actualTextColor,
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: isDefaultBg ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
        transition: 'var(--transition-normal)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: linkTo ? 'pointer' : 'default',
        border: `1px solid ${isDark && !isDefaultBg ? 'var(--border)' : 'transparent'}`
      }}
      onMouseEnter={(e) => {
        if (linkTo) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = isDefaultBg ? '0 12px 32px var(--brand-glow)' : 'var(--shadow-md)'
        }
      }}
      onMouseLeave={(e) => {
        if (linkTo) {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = isDefaultBg ? 'var(--shadow-brand)' : 'var(--shadow-sm)'
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9, fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            {value}
          </div>
          {desc && (
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px', fontWeight: 500 }}>{desc}</div>
          )}
        </div>
        {icon && (
          <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <i className={`bi ${icon}`} style={{ fontSize: '24px' }} />
          </div>
        )}
      </div>

      {linkTo && (
        <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9 }}>
          Voir plus <i className="bi bi-arrow-right" style={{ fontSize: '12px' }} />
        </div>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
