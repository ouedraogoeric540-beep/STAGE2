import React from 'react'
import Card from '../../ui/Card'

export default function DashboardCard({ title, icon, iconColor, headerRight, children, style = {}, noPadding = false }) {
  // Map DashboardCard props to the new Card component props
  return (
    <Card
      title={title}
      icon={icon}
      headerAction={headerRight}
      noPadding={noPadding}
      style={{ marginBottom: 32, ...style }}
    >
      {children}
    </Card>
  )
}
