import { useState } from 'react'
import Layout from '../../components/common/Layout'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact', form)
      toast.success('Votre message a bien été envoyé !')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Contactez-nous">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h1 className="h3">Nous Contacter</h1>
                  <p className="text-muted">Une question ? Un problème ? N'hésitez pas à nous écrire.</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Nom complet</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg bg-light border-0" 
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Adresse email</label>
                    <input 
                      type="email" 
                      className="form-control form-control-lg bg-light border-0" 
                      placeholder="jean@example.com"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Message</label>
                    <textarea 
                      className="form-control bg-light border-0" 
                      rows="5"
                      placeholder="Comment pouvons-nous vous aider ?"
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-brand w-100" 
                    disabled={loading}
                    style={{ padding: '12px', fontSize: 16, fontWeight: 600, borderRadius: 8 }}
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
