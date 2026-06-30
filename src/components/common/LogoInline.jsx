export default function LogoInline({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/logo.png"
        alt="SecurePass"
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <span style={{
        fontSize: size * 0.45,
        fontWeight: 900,
        letterSpacing: 1.5,
        display: 'flex', alignItems: 'center', color: 'var(--text-primary)'
      }}>
        <span style={{ color: '#0D6EFD' }}>
          <span style={{ fontSize: '1.2em' }}>S</span>ECURE
        </span>
        <span style={{ color: '#E83E8C' }}>
          <span style={{ fontSize: '1.2em' }}>P</span>ASS
        </span>
      </span>
    </div>
  )
}