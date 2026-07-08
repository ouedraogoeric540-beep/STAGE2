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
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    api.get('/evenements', { params: { page: page } })
      .then((res) => {
        if (res.data && res.data.data) {
          setEvenements(res.data.data)
          setTotalPages(res.data.last_page || 1)
        } else {
          setEvenements(Array.isArray(res.data) ? res.data : [])
          setTotalPages(1)
        }
      })
      .catch(() => toast.error('Erreur de chargement des événements'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <Layout title="Événements Actifs">
      <div className="animate-fadeIn" id="events-top">
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
          <>
            <div className="event-grid">
              {evenements.map((ev, i) => (
                <EventCard key={ev.id} ev={ev} isDark={isDark} i={i} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
                <button
                  onClick={() => { setPage(page - 1); document.getElementById('events-top')?.scrollIntoView({ behavior: 'smooth' }) }}
                  disabled={page === 1}
                  style={{
                    padding: '10px 16px', background: page === 1 ? (isDark ? '#1e2130' : '#f0f2f5') : 'var(--brand-color)',
                    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10,
                    color: page === 1 ? 'var(--text-muted)' : 'var(--brand-text)', cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  <i className="bi bi-chevron-left" /> Précédent
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => { setPage(p); document.getElementById('events-top')?.scrollIntoView({ behavior: 'smooth' }) }}
                          style={{
                            width: 40, height: 40, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                            background: p === page ? 'var(--brand-color)' : (isDark ? '#1e2130' : '#f0f2f5'),
                            color: p === page ? 'var(--brand-text)' : 'var(--text-primary)',
                            border: `1px solid ${p === page ? 'transparent' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {p}
                        </button>
                      )
                    }
                    if (p === page - 2 || p === page + 2) {
                      return <span key={p} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 16 }}>…</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => { setPage(page + 1); document.getElementById('events-top')?.scrollIntoView({ behavior: 'smooth' }) }}
                  disabled={page === totalPages}
                  style={{
                    padding: '10px 16px', background: page === totalPages ? (isDark ? '#1e2130' : '#f0f2f5') : 'var(--brand-color)',
                    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10,
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--brand-text)', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  Suivant <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
          </>
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
