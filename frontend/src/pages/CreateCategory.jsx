import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function CreateCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/categories', { name, description });
      navigate('/seller');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <Link to="/seller" className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to dashboard</Link>
        <div className="card form-enterprise animate-fade-in" style={{ padding: '2rem' }}>
          <h1 className="form-heading">Create category</h1>
          <p className="form-heading-sub">Categories help bidders filter auctions (e.g. Electronics, Art).</p>
          <form onSubmit={handleSubmit}>
            {error && <p className="msg-error">{error}</p>}
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Electronics" />
            </div>
            <div className="form-group">
              <label>Description <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(optional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" style={{ minHeight: 90 }} />
            </div>
            <div className="submit-block">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating...' : 'Create category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
