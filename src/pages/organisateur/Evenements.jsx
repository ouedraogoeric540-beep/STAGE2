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
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

import api from '../../api/axios'
import toast from 'react-hot-toast'

const formVide = {
  titre: '', type: 'autre', description: '', date: '', is_multijour: false, dates_multiples: [], lieu: '',
  capacite_max: '', statut: 'actif', image: null, categories: [],
}

export default function OrgEvenements() {
  const { isDark } = useTheme()
  const [evenements, setEvenements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(formVide)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsEvent, setDetailsEvent] = useState(null)
  const location = useLocation()

  // Parsing URL query parameters for filtering
  const queryParams = new URLSearchParams(location.search)
  const statusFilter = queryParams.get('status')

  const charger = (showLoading = true) => {
    if (showLoading) setLoading(true)
    api.get('/mes-evenements')
      .then((r) => setEvenements(r.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setTimeout(() => charger(false), 0) }, [])

  const ouvrirCreer = () => { setEditing(null); setForm(formVide); setErrors({}); setShowModal(true) }
  const ouvrirEditer = (ev) => {
    setEditing(ev.id)
    setErrors({})
    setForm({
      titre: ev.titre, type: ev.type || 'autre', description: ev.description || '',
      date: ev.date?.slice(0, 16),
      is_multijour: !!(ev.dates_multiples && ev.dates_multiples.length > 0),
      dates_multiples: ev.dates_multiples ? ev.dates_multiples.map(d => d.slice(0, 16)) : [],
      lieu: ev.lieu, capacite_max: ev.capacite_max,
      statut: ev.statut, image: null,
      categories: ev.categories?.map((c) => ({ nom: c.nom, prix: String(c.prix), quantite_total: String(c.quantite_total) })) || []
    })
    setShowModal(true)
  }

  const demanderSuppression = (ev) => {
    setDeleteEvent(ev)
  }

  const fermerSuppression = () => {
    setDeleteEvent(null)
  }

  const supprimer = async (id) => {
    if (!id) return
    setDeleteLoading(true)
    try {
      await api.delete(`/evenements/${id}`)
      toast.success('Événement supprimé')
      charger()
      fermerSuppression()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeleteLoading(false)
    }
  }

  const exporterCSV = async (id) => {
    try {
      toast.loading('Génération du fichier...', { id: 'export' })
      const response = await api.get(`/evenements/${id}/export-participants`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_evenement_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Export réussi', { id: 'export' });
    } catch {
      toast.error('Erreur lors de l\'export', { id: 'export' });
    }
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
      if (form.is_multijour && form.dates_multiples) {
        form.dates_multiples.forEach((d, i) => {
          if (d) data.append(`dates_multiples[${i}]`, d)
        });
      }
      data.append('lieu', form.lieu)
      data.append('capacite_max', form.capacite_max)
      data.append('statut', form.statut)
      data.append('categories', JSON.stringify(catsValides))
      if (form.image) data.append('image', form.image)

      await api.post(editing ? `/evenements/${editing}?_method=PUT` : '/evenements', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(editing ? 'Événement modifié ' : 'Événement créé ')
      setShowModal(false); charger()
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
    <Layout title="Mes Événements">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Mes Événements</h2>
          <Button onClick={ouvrirCreer} variant="primary" icon="bi-plus-circle">
            Créer un événement
          </Button>
        </div>

        {/* ── Tableau des événements ── */}
        <DashboardCard noPadding={true}>
          <DashboardTable 
            headers={['Événement', 'Date & Lieu', 'Revenus', 'Statut', 'Actions']}
            isEmpty={!loading && evenements.filter(ev => statusFilter ? ev.statut === statusFilter : true).length === 0}
            emptyText="Aucun événement trouvé"
            emptyIcon="bi-calendar-x"
          >
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span className="spinner-border text-primary" />
                </td>
              </tr>
            ) : evenements.filter(ev => statusFilter ? ev.statut === statusFilter : true).map((ev) => {
              const rev = ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
              return (
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
                    <div><i className="bi bi-calendar3"/> {new Date(ev.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}><i className="bi bi-geo-alt" /> {ev.lieu}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--success)' }}>
                    {Number(rev).toLocaleString()} FCFA
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <StatusBadge statut={ev.statut} />
                  </td>
                  <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                    <div className="d-flex align-items-center gap-2">
                      <Button onClick={() => setDetailsEvent(ev)} variant="soft" size="sm">
                        Détails
                      </Button>
                      <Button onClick={() => ouvrirEditer(ev)} variant="outline" size="sm" icon="bi-pencil" disabled={ev.statut !== 'actif' && ev.statut !== 'en_attente'} />
                      <ActionMenu
                        options={[
                          { label: 'Exporter (CSV)', icon: 'bi-file-earmark-excel-fill', color: 'var(--success)', onClick: () => exporterCSV(ev.id) },
                          { divider: true },
                          { label: 'Supprimer', icon: 'bi-trash-fill', color: 'var(--danger)', onClick: () => demanderSuppression(ev) }
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </DashboardTable>
        </DashboardCard>
      </div>

      {/* ── Modal suppression personnalisée ── */}
      <ConfirmModal
        isOpen={!!deleteEvent}
        title="Confirmer la suppression"
        message="Cette action supprimera définitivement l'événement et toutes ses catégories. Vous ne pourrez pas revenir en arrière."
        onConfirm={() => supprimer(deleteEvent.id)}
        onCancel={fermerSuppression}
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
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Date</small>
                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(detailsEvent.date).toLocaleString()}</strong>
                </div>
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Lieu</small>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailsEvent.lieu}</strong>
                </div>
                <div className="col-6">
                  <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12 }}>Type</small>
                  <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{detailsEvent.type}</strong>
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

      {/* ── Modal (Création / Modification) ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Modifier l\'événement' : 'Créer un événement'}
        size="md"
        glass={false}
      >
        {!editing && (
          <Alert variant="warning" icon="bi-info-circle-fill" style={{ marginBottom: 20 }}>
            Votre événement sera placé "En attente" et devra être validé par un administrateur avant de devenir public.
          </Alert>
        )}

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
    </Layout>
  )
}