import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import Loader from './Loader'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const { isDark } = useTheme()

  // Définition des tailles
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
    md: { padding: '12px 24px', fontSize: '14px', borderRadius: '12px' },
    lg: { padding: '16px 32px', fontSize: '16px', borderRadius: '14px' },
    icon: { padding: '10px', fontSize: '16px', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center' }
  }

  // Définition des variantes
  const variantStyles = {
    primary: {
      background: 'var(--brand-color)',
      color: '#fff',
      border: 'none',
      boxShadow: 'var(--shadow-brand)',
    },
    secondary: {
      background: isDark ? '#1e293b' : '#fff',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    },
    danger: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
    },
    soft: {
      background: 'var(--brand-glow)',
      color: 'var(--brand-color)',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    }
  }

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
    opacity: (disabled || loading) ? 0.65 : 1,
    transition: 'var(--transition-normal)',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style
  }

  const handleMouseEnter = (e) => {
    if (disabled || loading) return
    if (variant === 'primary' || variant === 'danger') {
      e.currentTarget.style.filter = 'brightness(1.1)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = 'var(--bg-surface)'
      e.currentTarget.style.borderColor = 'var(--border-hover)'
      e.currentTarget.style.transform = 'translateY(-1px)'
    } else if (variant === 'soft') {
      e.currentTarget.style.background = 'var(--brand-color)'
      e.currentTarget.style.color = '#fff'
      e.currentTarget.style.transform = 'translateY(-1px)'
    } else if (variant === 'ghost') {
      e.currentTarget.style.background = 'var(--bg-surface)'
      e.currentTarget.style.color = 'var(--text-primary)'
    }
  }

  const handleMouseLeave = (e) => {
    if (disabled || loading) return
    if (variant === 'primary' || variant === 'danger') {
      e.currentTarget.style.filter = 'none'
      e.currentTarget.style.transform = 'none'
    } else if (variant === 'secondary') {
      e.currentTarget.style.background = variantStyles.secondary.background
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.transform = 'none'
    } else if (variant === 'soft') {
      e.currentTarget.style.background = variantStyles.soft.background
      e.currentTarget.style.color = variantStyles.soft.color
      e.currentTarget.style.transform = 'none'
    } else if (variant === 'ghost') {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = 'var(--text-secondary)'
    }
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {loading ? (
        <Loader size={size === 'sm' ? 14 : 18} color={variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--brand-color)'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <i className={`bi ${icon}`} />}
          {children}
          {icon && iconPosition === 'right' && <i className={`bi ${icon}`} />}
        </>
      )}
    </button>
  )
}
