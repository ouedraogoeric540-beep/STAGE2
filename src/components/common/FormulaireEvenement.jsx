import { useState } from 'react'

const TYPES_EVENEMENT = [
  { value: 'concert',     label: 'Concert',     },
  { value: 'conference',  label: 'Conférence',  },
  { value: 'sport',       label: 'Sport',        },
  { value: 'soiree',      label: 'Soirée',      },
  { value: 'festival',    label: 'Festival',    },
  { value: 'theatre',     label: 'Théâtre',     },
  { value: 'exposition',  label: 'Exposition',  },
  { value: 'autre',       label: 'Autre',       },
]

const CATEGORIES_PREDEFINIES = [
  { nom: 'VIP',              prix: '',  quantite_total: '' },
  { nom: 'Standard',         prix: '',  quantite_total: '' },
  { nom: 'Économique',       prix: '',  quantite_total: '' },
  { nom: 'Entrée Générale',  prix: '',  quantite_total: '' },
  { nom: 'gratuit',          prix: '0', quantite_total: '' },   
]

export default function FormulaireEvenement({ form, setForm, onSubmit, saving, editing, onClose, isDark }) {
  const [etape, setEtape] = useState(1);

  const nextStep = () => {
    if (etape === 1 && (!form.titre || !form.type)) return;
    if (etape === 2 && (!form.date || !form.lieu)) return;
    setEtape(e => e + 1);
  }

  const prevStep = () => setEtape(e => e - 1);

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    borderRadius: 8, color: 'var(--text-primary)',
    fontSize: 13, outline: 'none', marginTop: 4,
  }

  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }

  // Ajouter une catégorie prédéfinie
  const ajouterCategorie = (nom) => {
    // Vérifier si déjà présente
    const dejaPresente = form.categories.some((c) => c.nom === nom)
    if (dejaPresente) {
      // Supprimer si déjà présente
      setForm({ ...form, categories: form.categories.filter((c) => c.nom !== nom) })
    } else {
      // Ajouter si pas présente
      const isGratuit = nom.toLowerCase() === 'gratuit'
      setForm({ ...form, categories: [...form.categories.filter((c) => c.nom !== ''), { nom, prix: isGratuit ? '0' : '', quantite_total: '' }] })
    }
  }

  const updateCat = (i, field, value) => {
    const cats = [...form.categories]
    cats[i][field] = value
    const isIllimite = cats.some(c => c.quantite_total === '-1')
    if (isIllimite) {
      setForm({ ...form, categories: cats, capacite_max: '' })
    } else {
      const total = cats.reduce((sum, c) => sum + (parseInt(c.quantite_total) || 0), 0)
      setForm({ ...form, categories: cats, capacite_max: total > 0 ? String(total) : '' })
    }
  }

  const removeCat = (i) => {
    const cats = form.categories.filter((_, idx) => idx !== i)
    const isIllimite = cats.some(c => c.quantite_total === '-1')
    if (isIllimite) {
      setForm({ ...form, categories: cats, capacite_max: '' })
    } else {
      const total = cats.reduce((sum, c) => sum + (parseInt(c.quantite_total) || 0), 0)
      setForm({ ...form, categories: cats, capacite_max: total > 0 ? String(total) : '' })
    }
  }

  return (
    <div 
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
    >

      {/* ── Indicateur de progression ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{
            flex: 1, height: 6, borderRadius: 4,
            background: etape >= step ? 'var(--primary)' : (isDark ? '#2a2d3e' : '#e2e8f0'),
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>

      {etape === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* Titre */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Titre *</label>
        <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required style={inputStyle} placeholder="Nom de l'événement" />
      </div>

      {/* Type d'événement */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Type d'événement *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {TYPES_EVENEMENT.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setForm({ ...form, type: type.value })}
              style={{
                flex: '1 1 calc(50% - 8px)',
                padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${form.type === type.value ? '#0D6EFD' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                background: form.type === type.value ? 'rgba(13,110,253,0.1)' : 'transparent',
                color: form.type === type.value ? '#0D6EFD' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description de l'événement" />
      </div>
      </div>
      )}

      {etape === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Date + Lieu */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: 200 }}>
          <label style={labelStyle}>Date {form.is_multijour ? '(Première date)' : ''} *</label>
          <input type="datetime-local" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} required style={inputStyle} />
        </div>
        
        {/* Switch Multi-jours */}
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={form.is_multijour}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm({ 
                  ...form, 
                  is_multijour: checked,
                  dates_multiples: checked ? (form.dates_multiples?.length ? form.dates_multiples : ['']) : [] 
                });
              }}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Cet événement a lieu sur plusieurs dates
            </span>
          </label>
        </div>

        {form.is_multijour && (
          <div style={{ flex: '1 1 100%', animation: 'fadeIn 0.3s ease', background: isDark ? '#1e2130' : '#f8fafc', padding: 12, borderRadius: 8, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <label style={{...labelStyle, marginBottom: 8, display: 'block'}}>Autres dates prévues</label>
            {(form.dates_multiples || []).map((d, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input 
                  type="datetime-local" 
                  value={d}
                  onChange={(e) => {
                    const newDates = [...(form.dates_multiples || [])];
                    newDates[index] = e.target.value;
                    setForm({ ...form, dates_multiples: newDates });
                  }} 
                  required 
                  style={{...inputStyle, marginTop: 0, flex: 1}} 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newDates = (form.dates_multiples || []).filter((_, i) => i !== index);
                    setForm({ ...form, dates_multiples: newDates.length ? newDates : [''] });
                  }}
                  style={{ background: 'none', border: 'none', color: '#DC3545', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setForm({ ...form, dates_multiples: [...(form.dates_multiples || []), ''] })}
              style={{ fontSize: 12, color: '#0D6EFD', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              + Ajouter une autre date
            </button>
          </div>
        )}

        <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: 200 }}>
          <label style={labelStyle}>Lieu *</label>
          <input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })}
            required style={inputStyle} placeholder="Ville, Salle..." />
        </div>
      </div>


      {/* Image */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Image ou Affiche de l'événement</label>
        <div style={{
          marginTop: 8,
          border: `2px dashed ${form.image ? '#10b981' : (isDark ? '#2a2d3e' : '#cbd5e1')}`,
          borderRadius: 12,
          padding: '24px',
          textAlign: 'center',
          backgroundColor: form.image ? (isDark ? 'rgba(16, 185, 129, 0.05)' : '#ecfdf5') : (isDark ? '#1e2130' : '#f8fafc'),
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => document.getElementById('event-image-upload').click()}
        >
          <input 
            id="event-image-upload"
            type="file" 
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            style={{ display: 'none' }} 
          />
          
          {form.image ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {typeof form.image === 'object' ? (
                 <div style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', background: '#e2e8f0', backgroundImage: `url(${URL.createObjectURL(form.image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                 <img src={form.image} alt="Affiche" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
              )}
              <div style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }}></i>
                Image sélectionnée
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {typeof form.image === 'object' ? form.image.name : 'Cliquez pour modifier'}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 8, display: 'block' }}></i>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Cliquez pour uploader une image</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Format supporté : JPG, PNG</div>
            </div>
          )}
        </div>
      </div>
      </div>
      )}

      {etape === 3 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* ── Catégories de tickets ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>
          <i className="bi bi-ticket-perforated" style={{ marginRight: 6, color: '#E83E8C' }} />
          Catégories de tickets *
        </label>

        {/* Sélection rapide */}
        <div style={{
          backgroundColor: isDark ? '#252839' : '#f7fafc',
          border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
          borderRadius: 10, padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
            Sélectionne les catégories souhaitées :
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES_PREDEFINIES.map((cat) => {
              const selectionne = form.categories.some((c) => c.nom === cat.nom)
              return (
                <button
                  key={cat.nom}
                  type="button"
                  onClick={() => ajouterCategorie(cat.nom)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    border: `2px solid ${selectionne ? '#E83E8C' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                    background: selectionne ? 'rgba(232,62,140,0.1)' : 'transparent',
                    color: selectionne ? '#E83E8C' : 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600,
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {selectionne && <i className="bi bi-check-lg" />}
                  {cat.nom}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tableau des catégories sélectionnées */}
        {form.categories.filter((c) => c.nom).length > 0 ? (
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, overflow: 'hidden' }}>
            <div>
              <div>
                {/* Header tableau */}
                <div className="category-table-header" style={{ backgroundColor: isDark ? '#252839' : '#f0f2f5', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  <span>Catégorie</span>
                  <span>Prix (FCFA)</span>
                  <span>Quantité</span>
                  <span></span>
                </div>

                {form.categories.filter((c) => c.nom).map((cat, i) => (
                  <div key={i} className="category-table-row" style={{ borderTop: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                    {/* Nom (non modifiable) */}
                    <div className="category-name-cell" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E83E8C', display: 'inline-block' }} />
                      {cat.nom}
                    </div>
                    {/* Prix */}
                    <input
                      type="number" value={cat.nom.toLowerCase() === 'gratuit' ? '0' : cat.prix}
                      onChange={(e) => updateCat(form.categories.indexOf(cat), 'prix', e.target.value)}
                      required placeholder="Ex: 5000"
                      disabled={cat.nom.toLowerCase() === 'gratuit'}
                      style={{ ...inputStyle, marginTop: 0, opacity: cat.nom.toLowerCase() === 'gratuit' ? 0.6 : 1, cursor: cat.nom.toLowerCase() === 'gratuit' ? 'not-allowed' : 'text' }}
                    />
                    {/* Quantité */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <input
                        type={cat.quantite_total === '-1' ? 'text' : 'number'}
                        value={cat.quantite_total === '-1' ? 'Illimité ∞' : cat.quantite_total}
                        onChange={(e) => updateCat(form.categories.indexOf(cat), 'quantite_total', e.target.value)}
                        required={cat.quantite_total !== '-1'}
                        placeholder="Ex: 100"
                        disabled={cat.quantite_total === '-1'}
                        style={{ ...inputStyle, marginTop: 0, opacity: cat.quantite_total === '-1' ? 0.6 : 1, fontWeight: cat.quantite_total === '-1' ? 700 : 400 }}
                      />
                      <button
                        type="button"
                        onClick={() => updateCat(form.categories.indexOf(cat), 'quantite_total', cat.quantite_total === '-1' ? '' : '-1')}
                        style={{
                          marginTop: 6,
                          padding: '4px 10px',
                          borderRadius: 20,
                          border: `1px solid ${cat.quantite_total === '-1' ? '#10b981' : (isDark ? '#2a2d3e' : '#e2e8f0')}`,
                          background: cat.quantite_total === '-1' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                          color: cat.quantite_total === '-1' ? '#10b981' : 'var(--text-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          width: 'fit-content',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="bi bi-infinity" style={{ fontSize: 14 }}></i>
                        {cat.quantite_total === '-1' ? 'Illimité activé' : 'Rendre illimité'}
                      </button>
                    </div>
                    {/* Supprimer */}
                    <button type="button" onClick={() => removeCat(form.categories.indexOf(cat))} style={{ padding: '8px', background: 'rgba(220,53,69,0.1)', border: 'none', borderRadius: 8, color: '#DC3545', cursor: 'pointer' }}>
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13, backgroundColor: isDark ? '#1e2130' : '#fff', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10 }}>
            <i className="bi bi-ticket" style={{ fontSize: 24, display: 'block', marginBottom: 6 }} />
            Sélectionne au moins une catégorie ci-dessus
          </div>
        )}
      </div>
      </div>
      )}
      {/* Boutons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {etape > 1 ? (
          <button type="button" onClick={prevStep} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
            Précédent
          </button>
        ) : (
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, borderRadius: 10, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
            Annuler
          </button>
        )}

        {etape < 3 ? (
          <button type="button" onClick={nextStep} 
            disabled={
              (etape === 1 && (!form.titre || !form.type)) ||
              (etape === 2 && (!form.date || !form.lieu))
            }
            style={{
            flex: 2, padding: '12px',
            background: 'var(--primary)',
            border: 'none', borderRadius: 10, color: '#fff',
            cursor: ((etape === 1 && (!form.titre || !form.type)) || (etape === 2 && (!form.date || !form.lieu))) ? 'not-allowed' : 'pointer',
            fontWeight: 700, opacity: ((etape === 1 && (!form.titre || !form.type)) || (etape === 2 && (!form.date || !form.lieu))) ? 0.6 : 1,
          }}>
            Suivant
          </button>
        ) : (
          <button type="button" 
            onClick={(e) => {
               e.preventDefault();
               onSubmit(e);
            }}
            disabled={saving || form.categories.filter((c) => c.nom && c.prix && c.quantite_total).length === 0} style={{
            flex: 2, padding: '12px',
            background: 'var(--brand-color)',
            border: 'none', borderRadius: 10, color: 'var(--brand-text)',
            cursor: (saving || form.categories.filter((c) => c.nom && c.prix && c.quantite_total).length === 0) ? 'not-allowed' : 'pointer',
            fontWeight: 700, opacity: (saving || form.categories.filter((c) => c.nom && c.prix && c.quantite_total).length === 0) ? 0.6 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
          }}>
            {saving ? <div className="spinner-border spinner-border-sm" /> : <i className="bi bi-check2-circle" style={{ fontSize: 18 }} />}
            {saving ? 'Enregistrement...' : (editing ? 'Enregistrer' : 'Créer l\'événement')}
          </button>
        )}
      </div>
    </div>
  )
}