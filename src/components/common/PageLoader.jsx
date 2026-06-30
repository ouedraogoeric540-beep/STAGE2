import Logo from './Logo'

export default function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--bg-body)', gap: 24,
    }}>
      <div style={{ animation: 'float 2s ease-in-out infinite' }}>
        <Logo size="md" showTagline />
      </div>

      <div style={{
        width: 200, height: 3,
        backgroundColor: 'var(--border)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--gradient-primary)',
          borderRadius: 2,
          animation: 'progressBar 1.2s ease infinite',
        }} />
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Chargement en cours…
      </p>
    </div>
  )
}