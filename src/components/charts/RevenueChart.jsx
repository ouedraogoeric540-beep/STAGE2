import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function RevenueChart({ data }) {
  const { isDark } = useTheme();
  
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Aucune donnée disponible.</div>;

  const formattedData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    total: d.total
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke={isDark ? '#4b5563' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={isDark ? '#4b5563' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} F`} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
          <Tooltip 
            contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            formatter={(value) => [`${value} FCFA`, 'Revenus']}
          />
          <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
