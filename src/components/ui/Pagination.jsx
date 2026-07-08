import React from 'react'
import Button from './Button'

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  style = {}
}) {
  if (totalPages <= 1) return null

  const getPages = () => {
    let pages = []
    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages]
      } else if (currentPage >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
      }
    }
    return pages
  }

  return (
    <div
      className={`ui-pagination ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        ...style
      }}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '8px 12px' }}
      >
        <i className="bi bi-chevron-left" style={{ fontSize: 12 }} /> Précédent
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {getPages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} style={{ padding: '0 8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                border: page === currentPage ? 'none' : '1px solid var(--border)',
                background: page === currentPage ? 'var(--brand-color)' : 'var(--bg-card)',
                color: page === currentPage ? '#fff' : 'var(--text-secondary)',
                fontWeight: page === currentPage ? 700 : 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                boxShadow: page === currentPage ? 'var(--shadow-brand)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--brand-color)'
                  e.currentTarget.style.color = 'var(--brand-color)'
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              {page}
            </button>
          )
        })}
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '8px 12px' }}
      >
        Suivant <i className="bi bi-chevron-right" style={{ fontSize: 12 }} />
      </Button>
    </div>
  )
}
