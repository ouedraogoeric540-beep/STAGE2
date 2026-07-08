import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

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

export default function FormulaireEvenement({ form, setForm, onSubmit, saving, editing, onClose, isDark, errors = {}, setErrors = () => {} }) {
  const [etape, setEtape] = useState(1);
  const getError = (field) => errors[field] ? errors[field][0] : null;

  const nextStep = () => {
    if (etape === 1 && (!form.titre || !form.type)) return;
    if (etape === 2 && (!form.date || !form.lieu)) return;
    setEtape(e => e + 1);
  }

  const prevStep = () => setEtape(e => e - 1);

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
            flex: 1, height: 6, borderRadius: 'var(--radius-sm)',
            background: etape >= step ? 'var(--primary)' : 'var(--border)',
            transition: 'var(--transition-normal)'
          }} />
        ))}
      </div>

      {etape === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>

          {/* Titre */}
          <div style={{ marginBottom: 16 }}>
            <Input 
              label="Titre *" 
              value={form.titre} 
              onChange={(e) => {
                setForm({ ...form, titre: e.target.value })
                if (errors.titre) setErrors({ ...errors, titre: null })
              }}
              required 
              placeholder="Nom de l'événement"
              error={getError('titre')}
            />
          </div>

          {/* Type d'événement */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Type d'événement *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TYPES_EVENEMENT.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, type: type.value })
                    if (errors.type) setErrors({ ...errors, type: null })
                  }}
                  style={{
                    flex: '1 1 calc(50% - 8px)',
                    padding: '10px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `2px solid ${form.type === type.value ? 'var(--brand-color)' : 'var(--border)'}`,
                    background: form.type === type.value ? 'var(--brand-glow)' : 'transparent',
                    color: form.type === type.value ? 'var(--brand-color)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600, textAlign: 'center',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {getError('type') && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{getError('type')}</div>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => {
                setForm({ ...form, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: null })
              }}
              rows={3} 
              style={{ 
                width: '100%', padding: '10px 14px',
                backgroundColor: 'var(--bg-input)',
                border: `1px solid ${errors.description ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', resize: 'vertical'
              }} 
              placeholder="Description de l'événement" 
            />
            {getError('description') && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{getError('description')}</div>}
          </div>
        </div>
      )}

      {etape === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Date + Lieu */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: 200 }}>
              <Input 
                type="datetime-local" 
                label={`Date ${form.is_multijour ? '(Première date)' : ''} *`} 
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value })
                  if (errors.date) setErrors({ ...errors, date: null })
                }} 
                required 
                error={getError('date')}
              />
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
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-color)' }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cet événement a lieu sur plusieurs dates
                </span>
              </label>
            </div>

            {form.is_multijour && (
              <div style={{ flex: '1 1 100%', animation: 'fadeIn 0.3s ease', background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', border: `1px solid var(--border)` }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>Autres dates prévues</label>
                {(form.dates_multiples || []).map((d, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <Input 
                        type="datetime-local" 
                        value={d}
                        onChange={(e) => {
                          const newDates = [...(form.dates_multiples || [])];
                          newDates[index] = e.target.value;
                          setForm({ ...form, dates_multiples: newDates });
                        }} 
                        required 
                      />
                    </div>
                    <Button 
                      variant="danger" 
                      onClick={() => {
                        const newDates = (form.dates_multiples || []).filter((_, i) => i !== index);
                        setForm({ ...form, dates_multiples: newDates.length ? newDates : [''] });
                      }}
                      icon="bi-trash"
                      style={{ marginTop: 0 }}
                    />
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  onClick={() => setForm({ ...form, dates_multiples: [...(form.dates_multiples || []), ''] })}
                  style={{ color: 'var(--brand-color)', padding: 0 }}
                >
                  + Ajouter une autre date
                </Button>
              </div>
            )}

            <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: 200, marginTop: 12 }}>
              <Input 
                label="Lieu *" 
                value={form.lieu} 
                onChange={(e) => {
                  setForm({ ...form, lieu: e.target.value })
                  if (errors.lieu) setErrors({ ...errors, lieu: null })
                }}
                required 
                placeholder="Ville, Salle..."
                error={getError('lieu')}
              />
            </div>
          </div>

          {/* Image */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Image ou Affiche de l'événement</label>
            <div style={{
              border: `2px dashed ${form.image ? 'var(--success)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: form.image ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'var(--transition-normal)'
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
                     <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover', background: 'var(--border)', backgroundImage: `url(${URL.createObjectURL(form.image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  ) : (
                     <img src={form.image} alt="Affiche" style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  )}
                  <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>
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
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>
              <i className="bi bi-ticket-perforated" style={{ marginRight: 6, color: 'var(--danger)' }} />
              Catégories de tickets *
            </label>

            {/* Sélection rapide */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
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
                        padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                        border: `2px solid ${selectionne ? 'var(--danger)' : 'var(--border)'}`,
                        background: selectionne ? 'rgba(232,62,140,0.1)' : 'transparent',
                        color: selectionne ? 'var(--danger)' : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 600,
                        transition: 'var(--transition-fast)',
                        display: 'flex', alignItems: 'center', gap: 6,
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
              <div style={{ backgroundColor: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div>
                  <div>
                    {/* Header tableau */}
                    <div className="category-table-header" style={{ backgroundColor: 'var(--bg-surface)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16 }}>
                      <span>Catégorie</span>
                      <span>Prix (FCFA)</span>
                      <span>Quantité</span>
                      <span></span>
                    </div>

                    {form.categories.filter((c) => c.nom).map((cat, i) => (
                      <div key={i} className="category-table-row" style={{ borderTop: `1px solid var(--border)`, padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center' }}>
                        {/* Nom (non modifiable) */}
                        <div className="category-name-cell" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
                          {cat.nom}
                        </div>
                        {/* Prix */}
                        <Input
                          type="number" value={cat.nom.toLowerCase() === 'gratuit' ? '0' : cat.prix}
                          onChange={(e) => updateCat(form.categories.indexOf(cat), 'prix', e.target.value)}
                          required placeholder="Ex: 5000"
                          disabled={cat.nom.toLowerCase() === 'gratuit'}
                          containerStyle={{ marginBottom: 0 }}
                        />
                        {/* Quantité */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Input
                            type={cat.quantite_total === '-1' ? 'text' : 'number'}
                            value={cat.quantite_total === '-1' ? 'Illimité ∞' : cat.quantite_total}
                            onChange={(e) => updateCat(form.categories.indexOf(cat), 'quantite_total', e.target.value)}
                            required={cat.quantite_total !== '-1'}
                            placeholder="Ex: 100"
                            disabled={cat.quantite_total === '-1'}
                            containerStyle={{ marginBottom: 0 }}
                          />
                          <button
                            type="button"
                            onClick={() => updateCat(form.categories.indexOf(cat), 'quantite_total', cat.quantite_total === '-1' ? '' : '-1')}
                            style={{
                              marginTop: 8,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              border: `1px solid ${cat.quantite_total === '-1' ? 'var(--success)' : 'var(--border)'}`,
                              background: cat.quantite_total === '-1' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                              color: cat.quantite_total === '-1' ? 'var(--success)' : 'var(--text-muted)',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              width: 'fit-content',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            <i className="bi bi-infinity" style={{ fontSize: 14 }}></i>
                            {cat.quantite_total === '-1' ? 'Illimité activé' : 'Rendre illimité'}
                          </button>
                        </div>
                        {/* Supprimer */}
                        <Button variant="danger" outline onClick={() => removeCat(form.categories.indexOf(cat))} icon="bi-x-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)', fontSize: 14, backgroundColor: 'var(--bg-surface)', border: `1px dashed var(--border)`, borderRadius: 'var(--radius-md)' }}>
                <i className="bi bi-ticket" style={{ fontSize: 32, display: 'block', marginBottom: 12, color: 'var(--text-secondary)' }} />
                Sélectionne au moins une catégorie ci-dessus
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Boutons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {etape > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep} style={{ flex: 1 }}>
            Précédent
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Annuler
          </Button>
        )}

        {etape < 3 ? (
          <Button 
            type="button" 
            variant="primary"
            onClick={nextStep} 
            disabled={(etape === 1 && (!form.titre || !form.type)) || (etape === 2 && (!form.date || !form.lieu))}
            style={{ flex: 2 }}
          >
            Suivant
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="primary"
            onClick={(e) => {
               e.preventDefault();
               onSubmit(e);
            }}
            disabled={saving || form.categories.filter((c) => c.nom && c.prix && c.quantite_total).length === 0} 
            loading={saving}
            icon="bi-check2-circle"
            style={{ flex: 2 }}
          >
            {editing ? 'Enregistrer' : 'Créer l\'événement'}
          </Button>
        )}
      </div>
    </div>
  )
}