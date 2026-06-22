import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function UpdateProfile() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    api
      .get('/users/me')
      .then(({ data }) => {
        setName(data.user.name ?? '');
        setMobile(data.user.mobile ?? '');
        setAddress(data.user.address ?? '');
        setAge(data.user.age !== undefined && data.user.age !== null ? String(data.user.age) : '');
        setLoaded(true);
      })
      .catch(() => navigate('/login', { replace: true }));
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if ((currentPassword || newPassword) && (!currentPassword || !newPassword)) {
      setError('To change password, fill both current password and new password');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('mobile', mobile);
      formData.append('address', address);
      formData.append('age', age);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);

      const { data } = await api.patch('/users/me', formData);
      login(data.user, token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate(user?.role === 'seller' ? '/seller' : '/bidder', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return <div className="page loading">Loading...</div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="auth-card form-enterprise animate-fade-in">
          <h1>Update profile</h1>
          <p className="form-subtitle">Edit your details. Change password section is optional.</p>
          <form onSubmit={handleSubmit}>
            {error && <p className="msg-error">{error}</p>}
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Mobile number <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span></label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" />
            </div>
            <div className="form-group">
              <label>Address <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span></label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, State" />
            </div>
            <div className="form-group">
              <label>Age <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span></label>
              <input type="number" min={1} max={150} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 25" />
            </div>
            <div className="form-group">
              <label>Profile picture <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span></label>
              {user?.avatar && (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.avatar}`}
                  alt="Current avatar"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem', display: 'block' }}
                />
              )}
              <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0] || null)} />
            </div>

            <div className="submit-block" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <h3 className="form-section-title" style={{ marginBottom: '0.75rem' }}>Change password <span style={{ fontWeight: 'normal', opacity: 0.9 }}>(optional)</span></h3>
              <div className="form-group">
                <label>Current password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </div>
              <div className="form-group">
                <label>New password (min 6)</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>

            <div className="submit-block">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
