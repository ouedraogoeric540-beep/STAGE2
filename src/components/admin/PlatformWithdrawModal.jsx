import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function PlatformWithdrawModal({ isOpen, onClose, onSubmit, soldeDisponible }) {
  const [montant, setMontant] = useState('')
  const [mode, setMode] = useState('mobile_money')
  const [destination, setDestination] = useState('')
  const [operateur, setOperateur] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const m = parseFloat(montant)
    if (!m || m < 100) {
      setError("Le montant doit être supérieur ou égal à 100.")
      return
    }
    if (m > soldeDisponible) {
      setError("Fonds insuffisants.")
      return
    }
    
    setLoading(true)
    try {
      await onSubmit({
        montant: m,
        mode,
        destination,
        operateur_ou_banque: operateur,
        commentaire
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du retrait")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-surface)', padding: '24px', borderRadius: 16,
        width: '100%', maxWidth: 500,
        maxHeight: '95vh', overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        margin: '16px'
      }}>
        <h4 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Retrait de fonds (Plateforme)</h4>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
            padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14
          }}>
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Montant à retirer (Max: {soldeDisponible.toLocaleString()} FCFA)
            </label>
            <Input
              type="number"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              placeholder="Ex: 50000"
              required
              max={soldeDisponible}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Mode de retrait</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-body)',
                color: 'var(--text-primary)', outline: 'none', fontSize: 14
              }}
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="banque">Virement Bancaire</option>
            </select>
          </div>

          {mode === 'mobile_money' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Opérateur</label>
                <Input
                  value={operateur}
                  onChange={e => setOperateur(e.target.value)}
                  placeholder="Ex: Wave, Orange, MTN..."
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Numéro de téléphone</label>
                <Input
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Ex: +225 0102030405"
                  required
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Nom de la Banque</label>
                <Input
                  value={operateur}
                  onChange={e => setOperateur(e.target.value)}
                  placeholder="Ex: Ecobank, SGCI..."
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>RIB / IBAN</label>
                <Input
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Ex: CI059..."
                  required
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Commentaire (Optionnel)</label>
            <textarea
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              placeholder="Raison du retrait..."
              style={{
                width: '100%', minHeight: 60, padding: '10px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-body)',
                color: 'var(--text-primary)', outline: 'none', fontSize: 14, resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <Button variant="outline" onClick={onClose} type="button">Annuler</Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Traitement...' : 'Confirmer le retrait'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
