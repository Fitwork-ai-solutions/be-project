import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function toLocalISO(date, time) {
  if (!date || !time) return '';
  return new Date(date + 'T' + time).toISOString();
}

function getDefaultDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function getDefaultTime(hour = 12, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function CreateAuction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [startDate, setStartDate] = useState(getDefaultDate(0));
  const [startTime, setStartTime] = useState(getDefaultTime(10, 0));
  const [endDate, setEndDate] = useState(getDefaultDate(1));
  const [endTime, setEndTime] = useState(getDefaultTime(22, 0));
  const [minIncrement, setMinIncrement] = useState('10');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    api.get('/items', { params: { seller: user._id } }).then(({ data }) => setItems(data.items || [])).catch(() => {});
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const startISO = toLocalISO(startDate, startTime);
    const endISO = toLocalISO(endDate, endTime);
    if (!startISO || !endISO) {
      setError('Please set start and end date & time.');
      return;
    }
    if (new Date(endISO) <= new Date(startISO)) {
      setError('End date & time must be after start.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auctions', {
        item,
        basePrice: Number(basePrice),
        startTime: startISO,
        endTime: endISO,
        minIncrement: Number(minIncrement) || 10,
      });
      navigate('/seller');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const formatPreview = (date, time) => {
    if (!date || !time) return '—';
    const d = new Date(date + 'T' + time);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="page">
      <div className="container create-auction-form">
        <Link to="/seller" className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to dashboard</Link>

        <div className="card form-enterprise animate-fade-in" style={{ padding: '2rem', maxWidth: 620 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.75rem', fontWeight: 700 }}>Create new auction</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Set item, pricing and schedule. Bidders will see it when it goes live.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <p className="msg-error">{error}</p>}

            <section className="form-section">
              <h2 className="form-section-title">Item & pricing</h2>
              <div className="form-group">
                <label>Select item</label>
                <select value={item} onChange={(e) => setItem(e.target.value)} required>
                  <option value="">Choose an item to auction</option>
                  {items.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select>
                {items.length === 0 && (
                  <small style={{ color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                    Add an item first from your dashboard.
                  </small>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Base price (Rs)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="form-group">
                  <label>Min bid increment (Rs)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2 className="form-section-title">Schedule</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                Auction will be live only between start and end. Use the date and time pickers below.
              </p>

              <div className="datetime-block">
                <div className="datetime-block-label">Start (auction goes live)</div>
                <div className="datetime-group">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      min={getDefaultDate(0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  → {formatPreview(startDate, startTime)}
                </div>
              </div>

              <div className="datetime-block">
                <div className="datetime-block-label">End (auction closes)</div>
                <div className="datetime-group">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate || getDefaultDate(0)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  → {formatPreview(endDate, endTime)}
                </div>
              </div>
            </section>

            <div className="submit-block">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || items.length === 0}
                style={{ width: '100%', padding: '1rem 1.5rem', fontSize: '1rem' }}
              >
                {loading ? 'Creating auction...' : 'Create auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
