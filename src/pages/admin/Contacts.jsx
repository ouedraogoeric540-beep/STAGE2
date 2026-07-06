import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import { useTheme } from '../../context/ThemeContext'
import api from '../../api/axios'
import ConfirmModal from '../../components/common/ConfirmModal'
import ActionMenu from '../../components/common/ActionMenu'
import toast from 'react-hot-toast'

export default function AdminContacts() {
  const { isDark } = useTheme()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMessage, setViewMessage] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const charger = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/contacts')
      setContacts(res.data)
    } catch (err) {
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/admin/contacts/${id}/read`)
      setContacts(contacts.map(c => c.id === id ? { ...c, read: 1 } : c))
      toast.success('Message marqué comme lu')
    } catch (err) {
      toast.error('Erreur')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      await api.delete(`/admin/contacts/${deleteId}`)
      toast.success('Message supprimé')
      setContacts(contacts.filter(c => c.id !== deleteId))
      setDeleteId(null)
      if (viewMessage?.id === deleteId) setViewMessage(null)
    } catch (err) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setSaving(false)
    }
  }

  const openMessage = (contact) => {
    setViewMessage(contact)
    if (!contact.read) {
      handleMarkAsRead(contact.id)
    }
  }

  return (
    <Layout title="Messages Contact">
      <div style={{ animation: 'fadeIn 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Messages Contact</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              {contacts.filter(c => !c.read).length} nouveau(x) message(s)
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 16, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: '#0D6EFD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <i className="bi bi-envelope-open" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
              Aucun message de contact.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0" style={{ color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#252839' : '#f8f9fa', borderBottom: `2px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, border: 'none' }}>Expéditeur</th>
                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, border: 'none' }}>Message</th>
                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, border: 'none' }}>Date</th>
                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, border: 'none', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} style={{ borderBottom: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`, backgroundColor: !contact.read ? (isDark ? '#1a1f35' : '#f0f7ff') : 'transparent', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                        <div style={{ fontWeight: !contact.read ? 700 : 500, color: 'var(--text-primary)', fontSize: 14 }}>{contact.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{contact.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none' }}>
                        <div style={{
                          maxWidth: '300px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 14,
                          fontWeight: !contact.read ? 600 : 400,
                          color: 'var(--text-primary)',
                          cursor: 'pointer'
                        }} onClick={() => openMessage(contact)}>
                          {contact.message}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(contact.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '16px 24px', verticalAlign: 'middle', border: 'none', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <ActionMenu
                            options={[
                              { label: 'Lire le message', icon: 'bi-envelope-open', color: '#0D6EFD', onClick: () => openMessage(contact) },
                              { divider: true },
                              { label: 'Supprimer', icon: 'bi-trash', color: '#ef4444', onClick: () => setDeleteId(contact.id) }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal View Message */}
      {viewMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ backgroundColor: isDark ? '#1e2130' : '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Message de {viewMessage.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  <i className="bi bi-envelope me-1"></i> {viewMessage.email}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  <i className="bi bi-calendar me-1"></i> {new Date(viewMessage.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
              <button onClick={() => setViewMessage(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}><i className="bi bi-x-lg" /></button>
            </div>
            
            <div style={{ padding: '16px', backgroundColor: isDark ? '#252839' : '#f8f9fa', borderRadius: 12, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '40vh', overflowY: 'auto' }}>
              {viewMessage.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
              <button onClick={() => setDeleteId(viewMessage.id)} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
                Supprimer
              </button>
              <button onClick={() => setViewMessage(null)} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le message"
        message="Êtes-vous sûr de vouloir supprimer ce message de contact ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={saving}
        isDanger={true}
      />
    </Layout>
  )
}
