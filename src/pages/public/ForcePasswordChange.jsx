import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ForcePasswordChange() {
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };
  
  const renderError = (field) => errors[field] ? <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{errors[field][0]}</div> : null;

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] });
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!regex.test(form.password)) {
      setErrors({ password: ['Le mot de passe ne respecte pas les critères de sécurité.'] });
      toast.error('Le mot de passe ne respecte pas les critères de sécurité.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/force-password-change', { password: form.password });
      toast.success('Mot de passe mis à jour avec succès !');
      
      // Update local user state
      const updatedUser = { ...user, is_temp_password: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (updatedUser.role === 'admin') navigate('/admin');
      else if (updatedUser.role === 'organisateur') navigate('/organisateur');
      else if (updatedUser.role === 'agent') navigate('/agent');
      else navigate('/mes-tickets');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
        toast.error('Veuillez corriger les erreurs signalées.');
      }
      else toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? '#252839' : '#f7fafc',
    border: `1px solid ${isDark ? '#2a2d3e' : '#e2e8f0'}`,
    color: isDark ? '#e8eaf0' : '#1a202c',
    borderRadius: 8, padding: '8px 12px',
    width: '100%', fontSize: 14, outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.4s ease', position: 'relative' }}>
        <div className="card-custom shadow-lg" style={{ position: 'relative', padding: '24px' }}>
          
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
            <ThemeToggle />
            <i className="bi bi-moon-stars-fill" style={{ color: 'var(--text-muted)', fontSize: 14 }} />
          </div>

          <div className="text-center" style={{ marginBottom: 16 }}>
            <Logo size="sm" />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 4 }}>
            Sécurisez votre compte
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
            Veuillez définir un nouveau mot de passe pour remplacer le mot de passe temporaire.
          </p>

          <div style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid #10b981', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 12, color: isDark ? '#a7f3d0' : '#065f46' }}>
            <strong>Critères obligatoires :</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
              <li>8 caractères minimum</li>
              <li>Une majuscule et une minuscule</li>
              <li>Un chiffre</li>
              <li>Un caractère spécial (@$!%*#?&)</li>
            </ul>
          </div>

          <form onSubmit={submit}>
            {/* Nouveau mot de passe */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Nouveau mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle} required
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36, ...(errors.password ? { borderColor: '#ef4444' } : {}) }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {renderError('password')}
            </div>

            {/* Confirmer */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Confirmer le mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConf ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handle} required
                  style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36, ...(errors.password_confirmation ? { borderColor: '#ef4444' } : {}) }}
                />
                <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <i className={`bi ${showConf ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
              {renderError('password_confirmation')}
            </div>

            <button type="submit" disabled={loading} className="btn btn-brand w-100" style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Mise à jour...
                </>
              ) : (
                <>Mettre à jour et continuer <i className="bi bi-arrow-right" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
