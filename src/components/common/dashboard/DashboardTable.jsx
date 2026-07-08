import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import EmptyState from '../../ui/EmptyState'

export default function DashboardTable({ headers, emptyText = 'Aucune donnée disponible', emptyIcon = 'bi-inbox', isEmpty = false, children }) {
  const { isDark } = useTheme()

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title="Aucune donnée"
        description={emptyText}
      />
    )
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className="sp-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ 
                padding: '16px 20px', 
                fontSize: '12px', 
                fontWeight: 700, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                whiteSpace: 'nowrap',
                borderBottom: '1px solid var(--border)'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Les lignes (tr) du body devraient idéalement avoir un style de bordure en bas `borderBottom: 1px solid var(--border)` */}
          {children}
        </tbody>
      </table>
    </div>
  )
}
