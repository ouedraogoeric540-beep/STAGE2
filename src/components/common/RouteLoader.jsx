import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function RouteLoader() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 0)
    const timer = setTimeout(() => setVisible(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!visible) return null

  return <div className="route-loader" />
}