const sizes = {
  sm:  { img: 32, title: 16, tag: 10 },
  md:  { img: 48, title: 22, tag: 11 },
  lg:  { img: 64, title: 28, tag: 12 },
  xl:  { img: 80, title: 34, tag: 13 },
}

export default function Logo({ size = 'md', showTagline = true }) {
  const s = sizes[size] || sizes.md

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <img
        src="/logo.png"
        alt="SecurePass"
        style={{ width: s.img, height: s.img, objectFit: 'contain' }}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
      <div style={{ fontSize: s.title, fontWeight: 900, letterSpacing: 2, display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
        <span style={{ color: '#0D6EFD' }}>
          <span style={{ fontSize: '1.2em' }}>S</span>ECURE
        </span>
        <span style={{ color: '#E83E8C' }}>
          <span style={{ fontSize: '1.2em' }}>P</span>ASS
        </span>
      </div>
      {showTagline && (
        <div style={{ fontSize: s.tag, color: 'var(--text-muted)', letterSpacing: 1 }}>
          Sécurisez vos événements
        </div>
      )}
    </div>
  )
}