import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormulaireEvenement from '../../components/common/FormulaireEvenement'
import ActionMenu from '../../components/common/ActionMenu'
import DashboardCard from '../../components/common/dashboard/DashboardCard'
import DashboardTable from '../../components/common/dashboard/DashboardTable'
import StatusBadge from '../../components/common/dashboard/StatusBadge'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import api from '../../api/axios'
import toast from 'react-hot-toast'

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
        if (r.data && r.data.data) {
          setEvenements(r.data.data)
          setCurrentPage(r.data.current_page || 1)
          setLastPage(r.data.last_page || 1)
        } else {
          setEvenements(Array.isArray(r.data) ? r.data : [])
          setCurrentPage(1)
          setLastPage(1)
        }
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

  return (
    <Layout title="Événements">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Événements
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: 4 }}>
              {evenements.length} événement(s) sur la plateforme
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              type="text"
              icon="bi-search"
              placeholder="Rechercher…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              containerStyle={{ minWidth: 220 }}
            />

            <Select 
              value={filtreStatut} 
              onChange={(e) => setFiltreStatut(e.target.value)} 
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'en_attente', label: 'En attente' },
                { value: 'actif', label: 'Actif' },
                { value: 'termine', label: 'Terminé' },
                { value: 'annule', label: 'Annulé' },
                { value: 'rejete', label: 'Rejeté' }
              ]}
              containerStyle={{ minWidth: 160 }}
            />

            <Button onClick={ouvrirCreer} variant="primary" icon="bi-plus-circle">
              Créer un événement
            </Button>
          </div>
        </div>

        {/* ── Tableau ── */}
        <DashboardCard noPadding={true}>
          <DashboardTable 
            headers={['Événement', 'Type', 'Date & Lieu', 'Organisateur', 'Tickets', 'Statut', 'Actions']}
            isEmpty={!loading && filtres.length === 0}
            emptyText="Aucun événement trouvé"
            emptyIcon="bi-calendar-x"
          >
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="sp-spinner mx-auto" />
                </td>
              </tr>
            ) : filtres.map((ev) => (
              <tr key={ev.id} 
                  style={{ borderTop: '1px solid var(--border)', transition: 'var(--transition-fast)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setDetailsEvent(ev)}
              >
                <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>
                  {ev.titre}
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                  {typeEmoji[ev.type] || '📅'} {ev.type || 'autre'}
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                  <div>{new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}><i className="bi bi-geo-alt" /> {ev.lieu}</div>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                  {ev.organisateur?.name || '—'}
                </td>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--brand-color)' }}>
                  {ev.tickets_count ?? 0} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ {ev.capacite_max || '∞'}</span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <StatusBadge statut={ev.statut} />
                </td>
                <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                  <ActionMenu 
                    options={[
                      { label: 'Voir Détails', icon: 'bi-eye-fill', color: 'var(--primary)', onClick: () => setDetailsEvent(ev) },
                      ...(ev.statut === 'en_attente' ? [
                        { label: 'Approuver', icon: 'bi-check-circle-fill', color: 'var(--success)', onClick: () => approuver(ev.id) },
                        { label: 'Rejeter', icon: 'bi-x-circle-fill', color: 'var(--danger)', onClick: () => { setRejectEventId(ev.id); setRejectReason(''); } }
                      ] : []),
                      { divider: true },
                      { label: 'Modifier', icon: 'bi-pencil-fill', color: 'var(--primary)', onClick: () => ouvrirEditer(ev) },
                      { label: 'Supprimer', icon: 'bi-trash-fill', color: 'var(--danger)', onClick: () => setDeleteEvent(ev) }
                    ]}
                  />
                </td>
              </tr>
            ))}
          </DashboardTable>

          {!loading && filtres.length > 0 && lastPage > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: `1px solid var(--border)` }}>
              <Button 
                variant="outline"
                disabled={currentPage === 1} 
                onClick={() => charger(currentPage - 1)}
                icon="bi-chevron-left"
              />
              <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Page {currentPage} sur {lastPage}
              </span>
              <Button 
                variant="outline"
                disabled={currentPage === lastPage} 
                onClick={() => charger(currentPage + 1)}
                icon="bi-chevron-right"
              />
            </div>
          )}
        </DashboardCard>

      {/* ── Modal Création / Modification ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Modifier l\'événement' : 'Créer un événement'}
        size="md"
        glass={false}
      >
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
      </Modal>

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
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 16, border: `1px solid var(--border)` }}>
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
      <Modal
        isOpen={!!detailsEvent}
        onClose={() => setDetailsEvent(null)}
        title="Informations de l'événement"
        size="md"
        footer={<Button variant="primary" onClick={() => setDetailsEvent(null)}>Fermer</Button>}
      >
        {detailsEvent && (
          <>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 20 }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 18, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>{detailsEvent.titre}</h4>
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
                  <StatusBadge statut={detailsEvent.statut} />
                </div>
              </div>
            </div>

            <h5 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Catégories de tickets</h5>
            {detailsEvent.categories?.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {detailsEvent.categories.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{c.nom}</strong>
                      <span style={{ fontSize: 13, color: 'var(--brand-color)', fontWeight: 600 }}>{Number(c.prix).toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Vendus : <strong style={{ color: 'var(--text-primary)' }}>{c.quantite_vendue}</strong> / {c.quantite_total <= 0 ? 'Illimité' : c.quantite_total}</div>
                      <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700, marginTop: 4 }}>Revenus : {(c.quantite_vendue * c.prix).toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune catégorie.</p>
            )}
          </>
        )}
      </Modal>

      {/* ── Modal de rejet ── */}
      <Modal
        isOpen={!!rejectEventId}
        onClose={() => setRejectEventId(null)}
        title="Motif du rejet"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectEventId(null)}>Annuler</Button>
            <Button variant="danger" onClick={rejeter} loading={rejecting}>Rejeter l'événement</Button>
          </>
        }
      >
        <form id="reject-form" onSubmit={rejeter}>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Expliquez pourquoi l'événement est rejeté..."
            required
            rows={4}
            style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-md)', border: `1px solid var(--border)`, background: 'var(--bg-input)', color: 'var(--text-primary)', resize: 'none', outline: 'none' }}
          />
        </form>
      </Modal>
      </div>
    </Layout>
  )
}