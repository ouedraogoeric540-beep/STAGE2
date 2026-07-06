import { useTheme } from '../../context/ThemeContext'

export default function DataTable({ columns, data, loading, emptyMessage = "Aucune donnée", onRowClick }) {
  const { isDark } = useTheme()

  return (
    <div className="table-responsive" style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, overflowX: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                {columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '14px 16px', textAlign: col.align || 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, ...(col.headerStyle || {}) }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr 
                    key={row.id || rowIndex} 
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ 
                      borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#f0f0f0'}`, 
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.15s' 
                    }}
                    onMouseEnter={(e) => { if(onRowClick) e.currentTarget.style.backgroundColor = isDark ? '#252839' : '#f8f9ff' }}
                    onMouseLeave={(e) => { if(onRowClick) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} style={{ padding: '14px 16px', textAlign: col.align || 'left', ...(col.cellStyle || {}) }}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
