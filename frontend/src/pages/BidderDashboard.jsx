import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';

export default function BidderDashboard() {
  const { user, logout } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/ai/recommend').then(({ data }) => setRecommendations(data.recommendations || '')).catch(() => {});
  }, []);

  useEffect(() => {
    const params = categoryFilter ? { category: categoryFilter } : { trending: 1 };
    api.get('/auctions', { params })
      .then(({ data }) => {
        const list = (data.auctions || []).filter((a) => a.status === 'live' || a.status === 'scheduled');
        setAuctions(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  const AuctionCard = ({ a }) => {
    const item = a.item || {};
    const imageUrl = getImageUrl(item.image) ?? `https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop`;
    return (
      <Link to={`/auction/${a._id}`} className="card card-auction animate-slide-up">
        <img src={imageUrl} alt={item.name} className="auction-card-image" />
        <div className="auction-card-body">
          <h3>{(item && item.name) || 'Item'}</h3>
          <span className="auction-price">Rs {a.currentPrice}</span>
          <span className={`auction-status ${a.status}`}>{a.status}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="page">
      <div className="container">
        <header className="app-header">
          <Link to="/bidder" style={{ textDecoration: 'none' }}><h1>Bidder Dashboard</h1></Link>
          <nav>
            <span>{user?.name || user?.email}</span>
            <Link to="/profile">Profile</Link>
            <button type="button" className="btn btn-ghost btn-danger" onClick={logout}>Logout</button>
          </nav>
        </header>

        {recommendations && (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.08) 100%)', borderColor: 'rgba(124,58,237,0.3)' }}>
            <strong style={{ color: 'var(--accent-light)' }}>AI recommendations</strong>
            <pre style={{ whiteSpace: 'pre-wrap', margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{recommendations}</pre>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: 280 }}>
          <label>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All (trending)</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <h2 className="section-title">Live & upcoming auctions</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="grid grid-2 stagger">
            {auctions.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No auctions right now. Check back later.</p>}
            {auctions.map((a) => <AuctionCard key={a._id} a={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
