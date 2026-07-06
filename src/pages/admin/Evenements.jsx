import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import ConfirmModal from '../../components/common/ConfirmModal'
import DataTable from '../../components/common/DataTable'
import FormulaireEvenement from '../../components/common/FormulaireEvenement'
import ActionMenu from '../../components/common/ActionMenu'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statutColor = { en_attente: '#f59e0b', actif: '#198754', termine: '#6c757d', annule: '#DC3545', rejete: '#ef4444' }

const typeEmoji = {
  concert: '🎵', conference: '🎤', sport: '⚽',
  soiree: '🎉', festival: '🎪', theatre: '🎭',
  exposition: '🖼️', autre: '📅',
}

const formVide = {
  titre: '', type: 'autre', description: '', date: '', lieu: '',
  capacite_max: '', statut: 'actif', image: null, categories: [],
}

export default function AdminEvenements() {
  const { isDark } = useTheme()

  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(formVide)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const location = useLocation()
  
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get('status') || ''
  })
  const [detailsEvent, setDetailsEvent] = useState(null)
  
  const [rejectEventId, setRejectEventId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  // Met à jour le filtreStatut si l'URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status')
    if (status !== null) {
      setFiltreStatut(status)
    } else {
      setFiltreStatut('')
    }
  }, [location.search])

  const charger = (page = currentPage, showLoading = true) => {
    if (showLoading) setLoading(true)
    api.get(`/admin/evenements?page=${page}`)
      .then((r) => {
        setEvenements(r.data.data)
        setCurrentPage(r.data.current_page)
        setLastPage(r.data.last_page)
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setTimeout(() => charger(false), 0) }, [])

  const filtres = evenements.filter((e) => {
    const matchRecherche = e.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      e.lieu?.toLowerCase().includes(recherche.toLowerCase())
    const matchStatut = filtreStatut ? e.statut === filtreStatut : true
    return matchRecherche && matchStatut
  })

  const ouvrirCreer = () => {
    setEditing(null)
    setForm(formVide)
    setErrors({})
    setShowModal(true)
  }

  const ouvrirEditer = (ev) => {
    setEditing(ev.id)
    setErrors({})
    setForm({
      titre: ev.titre,
      type: ev.type || 'autre',
      description: ev.description || '',
      date: ev.date?.slice(0, 16),
      lieu: ev.lieu,
      capacite_max: ev.capacite_max,
      statut: ev.statut,
      image: null,
      categories: ev.categories?.length
        ? ev.categories.map((c) => ({ nom: c.nom, prix: String(c.prix), quantite_total: String(c.quantite_total) }))
        : [],
    })
    setShowModal(true)
  }

  const supprimer = async () => {
    if (!deleteEvent) return
    setDeleteLoading(true)
    try {
      await api.delete(`/admin/evenements/${deleteEvent.id}`)
      toast.success('Événement supprimé')
      charger()
      setDeleteEvent(null)
    } catch { toast.error('Erreur suppression') }
    finally { setDeleteLoading(false) }
  }

  const approuver = async (id) => {
    try {
      await api.patch(`/admin/evenements/${id}/approuver`)
      toast.success('Événement approuvé')
      charger()
    } catch { toast.error('Erreur approbation') }
  }

  const rejeter = async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) return toast.error('Veuillez saisir un motif')
    setRejecting(true)
    try {
      await api.patch(`/admin/evenements/${rejectEventId}/rejeter`, { raison: rejectReason })
      toast.success('Événement rejeté')
      setRejectEventId(null)
      setRejectReason('')
      charger()
    } catch { toast.error('Erreur lors du rejet') }
    finally { setRejecting(false) }
  }

  const sauvegarder = async (e) => {
    e.preventDefault()

    const catsValides = form.categories.filter((c) => c.nom && c.prix && c.quantite_total)
    if (catsValides.length === 0) {
      toast.error('Sélectionnez au moins une catégorie avec prix et quantité')
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const data = new FormData()
      data.append('titre', form.titre)
      data.append('type', form.type)
      data.append('description', form.description)
      data.append('date', form.date)
      data.append('lieu', form.lieu)
      data.append('capacite_max', form.capacite_max)
      data.append('statut', form.statut)
      data.append('categories', JSON.stringify(catsValides))
      if (form.image) data.append('image', form.image)

      if (editing) {
        await api.post(`/admin/evenements/${editing}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Événement modifié ✅')
      } else {
        await api.post('/admin/evenements', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Événement créé ✅')
      }
      setShowModal(false)
      charger()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        setErrors(apiErrors)
        toast.error('Veuillez corriger les erreurs signalées')
      }
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSaving(false) }
  }

  const inputStyle = {
    padding: '9px 14px',
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    borderRadius: 8, color: 'var(--text-primary)',
    fontSize: 13, outline: 'none',
  }

  return (
    <Layout title="Événements">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Événements
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              {evenements.length} événement(s) sur la plateforme
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Recherche */}
            <div style={{ position: 'relative' }}>
              <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
              <input
                value={recherche} onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher…"
                style={{ ...inputStyle, paddingLeft: 36, width: 200 }}
              />
            </div>

            {/* Filtre statut */}
            <CustomSelect 
              value={filtreStatut} 
              onChange={setFiltreStatut} 
              placeholder="Tous les statuts"
              options={[
                { value: 'en_attente', label: 'En attente', color: '#f59e0b' },
                { value: 'actif', label: 'Actif', color: '#10b981' },
                { value: 'termine', label: 'Terminé', color: '#64748b' },
                { value: 'annule', label: 'Annulé', color: '#ef4444' },
                { value: 'rejete', label: 'Rejeté', color: '#ef4444' }
              ]}
              style={{ width: 150 }}
            />

            <button onClick={ouvrirCreer} style={{
              padding: '9px 20px',
              background: 'var(--primary)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="bi bi-plus-circle" /> Créer un événement
            </button>
          </div>
        </div>

        {/* ── Tableau ── */}
        <DataTable
          loading={loading}
          data={filtres}
          onRowClick={(ev) => setDetailsEvent(ev)}
          columns={[
            {
              header: 'Événement',
              render: (ev) => (
                <>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{ev.titre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    <i className="bi bi-geo-alt" style={{ marginRight: 4 }} />{ev.lieu}
                  </div>
                </>
              )
            },
            {
              header: 'Type',
              render: (ev) => (
                <span style={{ fontSize: 13 }}>
                  {typeEmoji[ev.type] || '📅'} {ev.type || 'autre'}
                </span>
              )
            },
            {
              header: 'Organisateur',
              render: (ev) => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ev.organisateur?.name || '—'}</span>
            },
            {
              header: 'Date',
              render: (ev) => <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            },
            {
              header: 'Capacité',
              accessor: 'capacite_max',
              cellStyle: { fontSize: 13, color: 'var(--text-secondary)' }
            },
            {
              header: 'Tickets',
              render: (ev) => <span style={{ fontWeight: 700, color: '#0D6EFD', fontSize: 15 }}>{ev.tickets_count ?? 0}</span>
            },
            {
              header: 'Statut',
              render: (ev) => (
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statutColor[ev.statut]}20`, color: statutColor[ev.statut] }}>
                  {ev.statut === 'en_attente' ? 'En attente' : ev.statut === 'rejete' ? 'Rejeté' : ev.statut}
                </span>
              )
            },
            {
              header: 'Actions',
              align: 'right',
              render: (ev) => (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                  <ActionMenu 
                    options={[
                      { label: 'Voir Détails', icon: 'bi-eye-fill', color: '#8b5cf6', onClick: () => setDetailsEvent(ev) },
                      ...(ev.statut === 'en_attente' ? [
                        { label: 'Approuver', icon: 'bi-check-circle-fill', color: '#10b981', onClick: () => approuver(ev.id) },
                        { label: 'Rejeter', icon: 'bi-x-circle-fill', color: '#ef4444', onClick: () => { setRejectEventId(ev.id); setRejectReason(''); } }
                      ] : []),
                      { divider: true },
                      { label: 'Modifier', icon: 'bi-pencil-fill', color: '#3b82f6', onClick: () => ouvrirEditer(ev) },
                      { label: 'Supprimer', icon: 'bi-trash-fill', color: '#ef4444', onClick: () => setDeleteEvent(ev) }
                    ]}
                  />
                </div>
              )
            }
          ]}
          emptyMessage={(
            <>
              <i className="bi bi-calendar-x" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
              Aucun événement trouvé
            </>
          )}
        />

          {!loading && filtres.length > 0 && lastPage > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => charger(currentPage - 1)}
                style={{ padding: '6px 12px', background: isDark ? '#252839' : '#f7fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: 6, color: 'var(--text-primary)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Page {currentPage} sur {lastPage}
              </span>
              <button 
                disabled={currentPage === lastPage} 
                onClick={() => charger(currentPage + 1)}
                style={{ padding: '6px 12px', background: isDark ? '#252839' : '#f7fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: 6, color: 'var(--text-primary)', cursor: currentPage === lastPage ? 'not-allowed' : 'pointer' }}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </div>


      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 580, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                <i className="bi bi-calendar-plus" style={{ marginRight: 8, color: '#0D6EFD' }} />
                {editing ? 'Modifier l\'événement' : 'Créer un événement'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <FormulaireEvenement
              form={form}
              setForm={setForm}
              onSubmit={sauvegarder}
              saving={saving}
              editing={editing}
              onClose={() => setShowModal(false)}
              isDark={isDark}
              errors={errors}
              setErrors={setErrors}
            />
          </div>
        </div>
      )}

      {/* ── Modal suppression personnalisée ── */}
      <ConfirmModal
        isOpen={!!deleteEvent}
        title="Confirmer la suppression"
        message="Cette action supprimera définitivement l'événement et toutes ses catégories. Vous ne pourrez pas revenir en arrière."
        onConfirm={supprimer}
        onCancel={() => setDeleteEvent(null)}
        loading={deleteLoading}
        confirmText="Supprimer définitivement"
        isDanger={true}
      >
        {deleteEvent && (
          <div style={{ background: isDark ? '#1e2334' : '#f8fafc', borderRadius: 12, padding: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Événement</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{deleteEvent.titre}</div>
            <div style={{ marginTop: 8, display: 'grid', gap: 4, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div><i className="bi bi-geo-alt-fill" style={{marginRight: 6}}></i>{deleteEvent.lieu}</div>
              <div><i className="bi bi-calendar-event-fill" style={{marginRight: 6}}></i>{new Date(deleteEvent.date).toLocaleString()}</div>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* ── Modal Détails de l'événement ── */}
      {detailsEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 500, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                <i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--brand-color)' }} />
                Informations de l'événement
              </h3>
              <button onClick={() => setDetailsEvent(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>
                <i className="bi bi-x" />
              </button>
            </div>

            <div style={{ background: isDark ? '#141827' : '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{detailsEvent.titre}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{detailsEvent.description || "Aucune description fournie."}</p>
              
              <div className="row g-3">
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Organisateur</small>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsEvent.organisateur?.name || '—'}</strong>
                </div>
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Lieu</small>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsEvent.lieu}</strong>
                </div>
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Date</small>
                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(detailsEvent.date).toLocaleString()}</strong>
                </div>
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Statut</small>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${statutColor[detailsEvent.statut]}20`, color: statutColor[detailsEvent.statut] }}>
                    {detailsEvent.statut === 'en_attente' ? 'En attente' : detailsEvent.statut === 'rejete' ? 'Rejeté' : detailsEvent.statut}
                  </span>
                </div>
              </div>
            </div>

            <h5 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Catégories de tickets</h5>
            {detailsEvent.categories?.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {detailsEvent.categories.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: isDark ? '#252839' : '#fff', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 12 }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{c.nom}</strong>
                      <span style={{ fontSize: 13, color: 'var(--brand-color)', fontWeight: 600 }}>{Number(c.prix).toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Vendus : <strong style={{ color: 'var(--text-primary)' }}>{c.quantite_vendue}</strong> / {c.quantite_total <= 0 ? 'Illimité' : c.quantite_total}</div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 4 }}>Revenus : {(c.quantite_vendue * c.prix).toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune catégorie.</p>
            )}
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button className="btn btn-brand" onClick={() => setDetailsEvent(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de rejet ── */}
      {rejectEventId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 16px 0', fontSize: 18 }}>Motif du rejet</h4>
            <form onSubmit={rejeter}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi l'événement est rejeté..."
                required
                rows={4}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#252839' : '#fff', color: 'var(--text-primary)', marginBottom: 16, resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRejectEventId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={rejecting} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: rejecting ? 'not-allowed' : 'pointer' }}>
                  {rejecting ? 'Rejet en cours...' : 'Rejeter l\'événement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}