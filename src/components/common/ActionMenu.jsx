import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';

export default function ActionMenu({ options }) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState({});

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const openUpwards = spaceBelow < 250 && spaceAbove > spaceBelow;
      
      setMenuCoords({
        top: openUpwards ? 'auto' : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : 'auto',
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = (e) => {
      // Si on scroll, on ferme le menu pour éviter qu'il ne se détache du bouton
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Capture the scroll event on all scrollable parents
      window.addEventListener('scroll', handleScroll, true); 
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          background: isOpen ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '18px',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent';
        }}
      >
        <i className="bi bi-three-dots-vertical" />
      </button>

      {isOpen && createPortal(
        <div ref={menuRef} style={{
          position: 'fixed',
          ...menuCoords,
          minWidth: 160,
          background: isDark ? '#1e293b' : '#fff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 99999,
          overflow: 'hidden',
          animation: 'slideUpFade 0.2s ease',
          padding: '4px 0'
        }}>
          {options.map((opt, i) => {
            if (opt.divider) {
              return <div key={`div-${i}`} style={{ height: 1, background: isDark ? '#334155' : '#e2e8f0', margin: '4px 0' }} />;
            }
            if (opt.hidden) return null;
            
            const isDisabled = opt.disabled;
            return (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    opt.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={isDisabled}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: isDisabled ? 'var(--text-muted)' : (opt.color || 'var(--text-primary)'),
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { if(!isDisabled) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { if(!isDisabled) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.icon && <i className={opt.icon.includes('bi-') ? `bi ${opt.icon}` : opt.icon} style={{ fontSize: 16 }} />}
                {opt.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
