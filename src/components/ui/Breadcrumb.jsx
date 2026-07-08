import React from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [], className = '', style = {} }) {
  return (
    <nav className={`ui-breadcrumb ${className}`} style={{ ...style }} aria-label="breadcrumb">
      <ol style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        fontSize: '13px',
        fontWeight: 600
      }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isLast ? (
                <span style={{ color: 'var(--text-primary)' }}>
                  {item.icon && <i className={`bi ${item.icon}`} style={{ marginRight: '6px' }} />}
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    to={item.to}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {item.icon && <i className={`bi ${item.icon}`} style={{ marginRight: '6px' }} />}
                    {item.label}
                  </Link>
                  <i className="bi bi-chevron-right" style={{ color: 'var(--border-hover)', fontSize: '10px' }} />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
