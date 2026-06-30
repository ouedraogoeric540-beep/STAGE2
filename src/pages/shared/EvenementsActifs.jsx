import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/public/EventCard'
import { useTheme } from '../../context/ThemeContext'

export default function EvenementsActifs() {
  const { isDark } = useTheme()
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    // Utilise la route publique qui ne retourne que les événements actifs
    api.get('/evenements')
      .then((res) => setEvenements(res.data.data || res.data))
      .catch(() => toast.error('Erreur de chargement des événements'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Événements Actifs">
      <div className="animate-fadeIn">
        <div style={{ marginBottom: 32 }}>
          <h2 className="sp-page-title">Événements Actifs</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Découvrez tous les événements actuellement disponibles sur la plateforme.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="sp-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : evenements.length > 0 ? (
          <div className="event-grid">
            {evenements.map((ev, i) => (
              <EventCard key={ev.id} ev={ev} isDark={isDark} i={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 48, display: 'block', marginBottom: 16 }} />
            Aucun événement actif pour le moment.
          </div>
        )}
      </div>
    </Layout>
  )
}
