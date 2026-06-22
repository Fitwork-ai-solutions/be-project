import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('bidder');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { email, password, name, role };
    if (mobile.trim()) payload.mobile = mobile.trim();
    if (address.trim()) payload.address = address.trim();
    if (age.trim()) payload.age = age.trim();
    try {
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      navigate(data.user.role === 'seller' ? '/seller' : '/bidder', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card form-enterprise animate-fade-in">
        <h1>Create account</h1>
        <p className="form-subtitle">Register as a bidder or seller. Optional fields can be updated later in profile.</p>
        <form onSubmit={handleSubmit}>
          {error && <p className="msg-error">{error}</p>}
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password (min 6)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
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
            <label>I want to</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="bidder">Bid on auctions</option>
              <option value="seller">Sell & run auctions</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
