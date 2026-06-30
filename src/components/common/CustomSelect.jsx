import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Sélectionner...", 
  style = {},
  icon,
  required
}) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState({});

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const openUpwards = spaceBelow < 250 && spaceAbove > spaceBelow;
      
      setMenuCoords({
        top: openUpwards ? 'auto' : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : 'auto',
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        containerRef.current && !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const selectedOption = options.find(o => String(o.value) === String(value));

  return (
    <>
      <div 
        ref={containerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...style,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isDark ? '#1e293b' : '#fff',
          border: `1px solid ${isOpen ? 'var(--brand-color)' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
          borderRadius: style.borderRadius || 12, 
          padding: style.padding || '12px 16px',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 3px rgba(13,110,253,0.15)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          {icon && !selectedOption?.icon && <i className={icon} style={{ color: 'var(--text-muted)' }} />}
          {selectedOption?.icon && (
            selectedOption.icon.includes('bi-')
              ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%',
                  background: selectedOption.color ? `${selectedOption.color}15` : 'rgba(0,0,0,0.05)',
                  color: selectedOption.color || 'var(--text-primary)'
                }}>
                  <i className={`bi ${selectedOption.icon}`} style={{ fontSize: 13 }} />
                </div>
              )
              : <span style={{ color: selectedOption.color || 'inherit' }}>{selectedOption.icon}</span>
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 8 }} />
      </div>

      {/* Hidden input for form validation if required */}
      {required && (
        <input 
          type="text" 
          value={value || ''} 
          onChange={() => {}} 
          required={required} 
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} 
        />
      )}

      {isOpen && createPortal(
        <div ref={menuRef} style={{
          position: 'fixed',
          ...menuCoords,
          background: isDark ? '#1e293b' : '#fff',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 99999,
          maxHeight: 300,
          overflowY: 'auto',
          animation: 'slideUpFade 0.2s ease',
          padding: '6px'
        }}>
          {!required && (
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 onChange('');
                 setIsOpen(false);
               }}
               style={{
                 padding: '10px 12px',
                 cursor: 'pointer',
                 borderRadius: 8,
                 color: 'var(--text-muted)',
                 fontSize: 14,
                 transition: 'background 0.2s'
               }}
               onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'}
               onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
             >
               {placeholder}
             </div>
          )}
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: 8,
                background: String(value) === String(opt.value) ? (isDark ? 'rgba(13,110,253,0.1)' : 'rgba(13,110,253,0.05)') : 'transparent',
                color: String(value) === String(opt.value) ? 'var(--brand-color)' : 'var(--text-primary)',
                fontWeight: String(value) === String(opt.value) ? 700 : 500,
                fontSize: 14,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (String(value) !== String(opt.value)) e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                if (String(value) !== String(opt.value)) e.currentTarget.style.background = 'transparent'
              }}
            >
              {opt.icon && (
                opt.icon.includes('bi-')
                  ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%',
                      background: opt.color ? `${opt.color}15` : 'rgba(0,0,0,0.05)',
                      color: opt.color || 'var(--text-primary)'
                    }}>
                      <i className={`bi ${opt.icon}`} style={{ fontSize: 14 }} />
                    </div>
                  )
                  : <span style={{ color: opt.color || 'inherit' }}>{opt.icon}</span>
              )}
              {opt.label}
              {String(value) === String(opt.value) && <i className="bi bi-check2 ms-auto" style={{ fontSize: 16 }} />}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
