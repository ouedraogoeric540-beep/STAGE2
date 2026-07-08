import React from 'react'
import Badge from '../../ui/Badge'

const STATUT_CONFIG = {
  // Statuts Événements
  actif:      { variant: 'success', label: 'ACTIF',     icon: 'bi-check-circle-fill' },
  termine:    { variant: 'secondary', label: 'TERMINÉ',   icon: 'bi-archive-fill' },
  annule:     { variant: 'danger',  label: 'ANNULÉ',    icon: 'bi-x-circle-fill' },
  // Statuts Retraits & Scans
  en_attente: { variant: 'warning', label: 'EN ATTENTE',icon: 'bi-clock-fill' },
  valide:     { variant: 'success', label: 'VALIDÉ',    icon: 'bi-check-circle-fill' },
  refuse:     { variant: 'danger',  label: 'REFUSÉ',    icon: 'bi-x-circle-fill' },
  rejete:     { variant: 'danger',  label: 'REJETÉ',    icon: 'bi-x-circle-fill' },
  // Autre
  default:    { variant: 'primary', label: 'INCONNU',   icon: 'bi-info-circle-fill' }
}

export default function StatusBadge({ statut, textOnly = false }) {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.default
  const label = cfg.label || statut.toUpperCase()

  if (textOnly) {
    return (
      <span style={{ fontSize: '12px', fontWeight: 700, color: `var(--${cfg.variant})` }}>
        {label}
      </span>
    )
  }

  return (
    <Badge variant={cfg.variant} icon={cfg.icon}>
      {label}
    </Badge>
  )
}
