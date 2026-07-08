import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function TopBarLoader() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const location = useLocation()

  useEffect(() => {
    // Déclenche le loader à chaque changement de route
    setLoading(true)
    setProgress(30) // Démarrage à 30%
    
    // Simule une progression rapide
    const interval = setInterval(() => {
      setProgress(old => {
        const newProgress = old + Math.random() * 20
        return newProgress > 90 ? 90 : newProgress // Bloque à 90% jusqu'à ce que ce soit fini
      })
    }, 100)

    // Simule la fin du chargement (dans un vrai cas, ce serait lié aux promesses de requêtes)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300) // Laisse le temps à la transition CSS de se finir
    }, 400) // Durée fictive pour simuler le chargement

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [location.pathname])

  if (!loading && progress === 0) return null

  return (
    <div
      className="topbar-loader"
      style={{
        width: `${progress}%`,
        opacity: loading ? 1 : 0
      }}
    />
  )
}
