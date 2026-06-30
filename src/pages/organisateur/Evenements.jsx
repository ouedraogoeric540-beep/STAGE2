import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import FormulaireEvenement from '../../components/common/FormulaireEvenement'
import ActionMenu from '../../components/common/ActionMenu'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statutColor = { actif: '#198754', termine: '#6c757d', annule: '#DC3545' }

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
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsEvent, setDetailsEvent] = useState(null)

  const charger = (showLoading = true) => {
    if (showLoading) setLoading(true)
    api.get('/mes-evenements')
      .then((r) => setEvenements(r.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setTimeout(() => charger(false), 0) }, [])

  const ouvrirCreer = () => { setEditing(null); setForm(formVide); setShowModal(true) }
  const ouvrirEditer = (ev) => {
    setEditing(ev.id)
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
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).forEach((e) => toast.error(e[0]))
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
        <div className="table-responsive" style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>Événement</th>
                <th style={{ padding: '16px', textAlign: 'left', whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Revenus</th>
                <th className="d-none d-md-table-cell" style={{ padding: '16px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evenements.map((ev) => {
                const rev = ev.categories?.reduce((cs, c) => cs + (c.quantite_vendue * c.prix), 0) || 0
                return (
                  <tr
                    key={ev.id}
                    style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#f0f0f0'}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#252839' : '#f8f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => setDetailsEvent(ev)}
                  >
                    <td style={{ padding: '16px', fontWeight: 600, minWidth: 120 }}>{ev.titre}</td>
                    <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>{new Date(ev.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>{Number(rev).toLocaleString()} FCFA</td>
                    <td className="d-none d-md-table-cell" style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: `${statutColor[ev.statut]}20`, color: statutColor[ev.statut] }}>
                        {ev.statut}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                        <ActionMenu
                          options={[
                            { label: 'Voir Détails', icon: 'bi-eye-fill', color: '#8b5cf6', onClick: () => setDetailsEvent(ev) },
                            { label: 'Exporter (CSV)', icon: 'bi-file-earmark-excel-fill', color: '#10b981', onClick: () => exporterCSV(ev.id) },
                            { divider: true },
                            { label: 'Modifier', icon: 'bi-pencil-fill', color: '#3b82f6', disabled: ev.statut !== 'actif', onClick: () => ouvrirEditer(ev) },
                            { label: 'Supprimer', icon: 'bi-trash-fill', color: '#ef4444', onClick: () => demanderSuppression(ev) }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal suppression personnalisée ── */}
      {deleteEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'radial-gradient(circle at top, rgba(13,110,253,0.18), transparent 30%), rgba(0,0,0,0.72)',
          zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            width: '100%', maxWidth: 620, backgroundColor: isDark ? '#141827' : '#ffffff',
            borderRadius: 28, padding: 32, boxShadow: '0 30px 90px rgba(0,0,0,0.35)',
            border: `1px solid ${isDark ? '#2a2d3e' : '#e8eef7'}`,
            animation: 'fadeIn 0.35s ease',
            transform: 'translateY(-8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: '#DC354520', color: '#DC3545', fontSize: 20 }}>
                    <i className="bi bi-exclamation-lg" />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>Confirmer la suppression</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginTop: 6 }}>
                      Cette action supprimera définitivement l'événement et toutes ses catégories. Vous ne pourrez pas revenir en arrière.
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={fermerSuppression} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 22, padding: 8, lineHeight: 1 }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ background: isDark ? '#1e2334' : '#f8fafc', borderRadius: 20, padding: 26, marginBottom: 28, boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.04)' : '0 0 0 1px rgba(13,110,253,0.08)' }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>Événement</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{deleteEvent.titre}</div>
              <div style={{ marginTop: 12, display: 'grid', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                <div>{deleteEvent.lieu}</div>
                <div>Date : {new Date(deleteEvent.date).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={fermerSuppression} style={{ flex: 1, minWidth: 140, padding: '14px 18px', borderRadius: 14, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, background: isDark ? '#161b2d' : '#f8fafd', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                Annuler
              </button>
              <button onClick={() => supprimer(deleteEvent.id)} disabled={deleteLoading} style={{ flex: 1, minWidth: 140, padding: '14px 18px', borderRadius: 14, border: 'none', background: deleteLoading ? '#dc3545aa' : '#dc3545', color: '#fff', fontWeight: 700, cursor: deleteLoading ? 'not-allowed' : 'pointer', boxShadow: '0 16px 28px rgba(220,53,69,0.2)', transition: 'transform 0.2s ease' }}>
                {deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Modal Détails de l'événement ── */}
      {detailsEvent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 32,
            width: '100%', maxWidth: 600, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
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
                    {detailsEvent.statut}
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
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Vendus : <strong style={{ color: 'var(--text-primary)' }}>{c.quantite_vendue}</strong> / {c.quantite_total}</div>
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

            <FormulaireEvenement
              form={form}
              setForm={setForm}
              onSubmit={sauvegarder}
              saving={saving}
              editing={editing}
              onClose={() => setShowModal(false)}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}