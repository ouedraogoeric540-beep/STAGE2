import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function TicketScansChart({ data }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Aucune donnée disponible.</div>;

  const formattedData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    scans: d.total
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" stroke={isDark ? '#4b5563' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={isDark ? '#4b5563' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
          <Tooltip 
            cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
            contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            formatter={(value) => [`${value}`, 'Tickets Scannés']}
          />
          <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
