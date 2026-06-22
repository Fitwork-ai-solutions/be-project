import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { uploadsBase } from '../services/api';

const MAX_LABEL_LEN = 14;
const truncate = (s) => (s && s.length > MAX_LABEL_LEN ? s.slice(0, MAX_LABEL_LEN) + '…' : s || '—');

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartStats, setChartStats] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    api.get('/auctions', { params: { seller: user._id } })
      .then(({ data }) => setAuctions(data.auctions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || user?.role !== 'seller') return;
    api.get('/auctions/stats/seller')
      .then(({ data }) => setChartStats(data.stats || []))
      .catch(() => setChartStats([]));
  }, [user?._id, user?.role]);

  const active = auctions.filter((a) => a.status === 'live');
  const past = auctions.filter((a) => a.status === 'ended' || a.status === 'scheduled');
  const chartData = chartStats.map((s) => ({
    ...s,
    name: truncate(s.itemName),
    fullName: s.itemName,
  }));

  const tickStyle = { fill: 'var(--text-muted)', fontSize: 11 };
  const tooltipStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0.5rem 0.75rem',
    color: 'var(--text)',
  };

  const AuctionCard = ({ a }) => {
    const item = a.item || {};
    const imageUrl = item.image ? `${uploadsBase}/${item.image}` : `https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop`;
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
          <Link to="/seller" style={{ textDecoration: 'none' }}><h1>Seller Dashboard</h1></Link>
          <nav>
            <span>{user?.name || user?.email}</span>
            <Link to="/profile">Profile</Link>
            <Link to="/seller/create-category">New category</Link>
            <Link to="/seller/create-item">Add item</Link>
            <Link to="/seller/create-auction">New auction</Link>
            <button type="button" className="btn btn-ghost btn-danger" onClick={logout}>Logout</button>
          </nav>
        </header>

        {chartData.length > 0 && (
          <section className="chart-section" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title">Auction performance</h2>
            <div className="chart-grid">
              <div className="card chart-card">
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Bids per auction (manual vs auto)</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={tickStyle} />
                    <YAxis tick={tickStyle} allowDecimals={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [value, name === 'manualBids' ? 'Manual bids' : 'Auto bids']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                      labelStyle={{ color: 'var(--accent-light)', marginBottom: 4 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text)' }} formatter={(v) => (v === 'manualBids' ? 'Manual bids' : 'Auto bids')} />
                    <Bar dataKey="manualBids" name="manualBids" stackId="bids" fill="var(--gold)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="autoBids" name="autoBids" stackId="bids" fill="var(--accent)" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card chart-card">
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Base vs current price (Rs)</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v) => `Rs ${v}`} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value, name) => [`Rs ${value}`, name === 'basePrice' ? 'Base price' : 'Current price']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                      labelStyle={{ color: 'var(--accent-light)', marginBottom: 4 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text)' }} formatter={(v) => (v === 'basePrice' ? 'Base price' : 'Current price')} />
                    <Bar dataKey="basePrice" name="basePrice" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentPrice" name="currentPrice" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        <h2 className="section-title">Active auctions</h2>
        {loading ? (
          <div className="loading">Loading auctions...</div>
        ) : (
          <div className="grid grid-2 stagger">
            {active.length === 0 && <p className="msg-error" style={{ color: 'var(--text-muted)' }}>No active auctions. Create one to get started.</p>}
            {active.map((a) => <AuctionCard key={a._id} a={a} />)}
          </div>
        )}

        <h2 className="section-title" style={{ marginTop: '2.5rem' }}>Past & scheduled</h2>
        <div className="grid grid-2">
          {past.length === 0 && <p style={{ color: 'var(--text-muted)' }}>None yet.</p>}
          {past.map((a) => <AuctionCard key={a._id} a={a} />)}
        </div>
      </div>
    </div>
  );
}
