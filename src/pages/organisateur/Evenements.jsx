import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import ConfirmModal from '../../components/common/ConfirmModal'
import FormulaireEvenement from '../../components/common/FormulaireEvenement'
import ActionMenu from '../../components/common/ActionMenu'
import DataTable from '../../components/common/DataTable'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statutColor = { en_attente: '#f59e0b', actif: '#198754', termine: '#6c757d', annule: '#DC3545', rejete: '#ef4444' }

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
    } catch (err) {
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Mes Événements</h2>
          <button onClick={ouvrirCreer} style={{ padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            + Créer un événement
          </button>
        </div>

        {/* ── Tableau des événements en ligne ── */}
        {/* ── Tableau ── */}
        <DataTable
          loading={loading}
          data={evenements.filter(ev => statusFilter ? ev.statut === statusFilter : true)}
          onRowClick={(ev) => setDetailsEvent(ev)}
          columns={[
            {
              header: 'Événement',
              accessor: 'titre',
              cellStyle: { fontWeight: 600, minWidth: 120 }
            },
            {
              header: 'Date',
              render: (ev) => <span style={{ whiteSpace: 'nowrap' }}>{new Date(ev.date).toLocaleDateString()}</span>
            },
            {
              header: 'Revenus',
              render: (ev) => {
                const rev = ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
                return <span style={{ color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>{Number(rev).toLocaleString()} FCFA</span>
              }
            },
            {
              header: 'Statut',
              headerStyle: { display: 'table-cell' }, // Can be hidden on mobile via CSS class in custom cell, but easier to just show it or add class
              render: (ev) => (
                <span className="d-none d-md-inline-block" style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statutColor[ev.statut]}20`, color: statutColor[ev.statut] }}>
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
                      { label: 'Exporter (CSV)', icon: 'bi-file-earmark-excel-fill', color: '#10b981', onClick: () => exporterCSV(ev.id) },
                      { divider: true },
                      { label: 'Modifier', icon: 'bi-pencil-fill', color: '#3b82f6', disabled: ev.statut !== 'actif' && ev.statut !== 'en_attente', onClick: () => ouvrirEditer(ev) },
                      { label: 'Supprimer', icon: 'bi-trash-fill', color: '#ef4444', onClick: () => demanderSuppression(ev) }
                    ]}
                  />
                </div>
              )
            }
          ]}
          emptyMessage="Aucun événement trouvé"
        />
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

      {/* ── Modal (Correction de l'affichage) ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: isDark ? '#1e2130' : '#fff',
            borderRadius: 20,
            padding: 32,
            width: '100%',
            maxWidth: 580,
            maxHeight: '90vh', // Limite la hauteur à 90% de l'écran
            overflowY: 'auto', // Active le scroll si le contenu est trop grand
            border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                <i className="bi bi-calendar-plus" style={{ marginRight: 8, color: '#0D6EFD' }} />
                {editing ? 'Modifier l\'événement' : 'Créer un événement'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {!editing && (
              <div style={{ marginBottom: 20, padding: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-info-circle-fill" style={{ fontSize: 16 }}></i>
                Votre événement sera placé "En attente" et devra être validé par un administrateur avant de devenir public.
              </div>
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
          </div>
        </div>
      )}
    </Layout>
  )
}