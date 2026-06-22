import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuctionRoom } from '../hooks/useAuctionRoom';
import api, { getImageUrl } from '../services/api';

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    currentPrice,
    countdownEnd,
    bidError,
    ended,
    loading,
    placeBid,
    setEnded,
    newBidTimestamp,
  } = useAuctionRoom(id);

  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [aiPredictedValue, setAiPredictedValue] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState('');
  const [autoBidIncrement, setAutoBidIncrement] = useState('50');
  const [autoBidDone, setAutoBidDone] = useState('');
  const [autoBidError, setAutoBidError] = useState('');
  const [myAutoBidConfig, setMyAutoBidConfig] = useState(null);
  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [bidsPage, setBidsPage] = useState(1);
  const [bidsList, setBidsList] = useState([]);
  const [bidsTotal, setBidsTotal] = useState(0);
  const [bidsTotalPages, setBidsTotalPages] = useState(0);
  const [bidsLoading, setBidsLoading] = useState(false);
  const BIDS_PER_PAGE = 10;

  useEffect(() => {
    if (!id) return;
    api.get(`/auctions/${id}`).then(({ data }) => {
      const a = data.auction;
      setAuction(a);
      if (a?.recommendedPrice != null) setRecommendedPrice(a.recommendedPrice);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id || user?.role !== 'bidder' || recommendedPrice != null) return;
    api.get(`/auctions/${id}/recommended-price`)
      .then(({ data }) => setRecommendedPrice(data.recommendedPrice ?? null))
      .catch(() => {});
  }, [id, user?.role, recommendedPrice]);

  const fetchMyAutoBid = () => {
    if (!id || user?.role !== 'bidder') return;
    api.get(`/auctions/${id}/auto-bid`).then(({ data }) => {
      setMyAutoBidConfig(data.config || null);
      if (data.config) {
        setAutoBidMax(String(data.config.maxAmount));
        setAutoBidIncrement(String(data.config.increment ?? 50));
      }
    }).catch(() => setMyAutoBidConfig(null));
  };
  useEffect(() => {
    fetchMyAutoBid();
  }, [id, user?.role]);

  const [latestBid, setLatestBid] = useState(null);

  const loadBidsPage = (page, options = {}) => {
    if (!id) return;
    const onlyUpdateLatest = options.onlyUpdateLatest === true;
    if (!onlyUpdateLatest) setBidsLoading(true);
    api.get(`/auctions/${id}/bids`, { params: { page, limit: BIDS_PER_PAGE } })
      .then(({ data }) => {
        const list = data.bids || [];
        if (!onlyUpdateLatest) {
          setBidsList(list);
          setBidsTotal(data.total ?? 0);
          setBidsTotalPages(data.totalPages ?? 0);
        }
        if (page === 1 && list.length > 0) setLatestBid(list[0]);
      })
      .catch(() => {
        if (!onlyUpdateLatest) {
          setBidsList([]);
          setBidsTotal(0);
          setBidsTotalPages(0);
        }
      })
      .finally(() => { if (!onlyUpdateLatest) setBidsLoading(false); });
  };

  useEffect(() => {
    loadBidsPage(bidsPage);
  }, [id, bidsPage]);

  useEffect(() => {
    if (!newBidTimestamp) return;
    if (bidsPage === 1) loadBidsPage(1);
    else loadBidsPage(1, { onlyUpdateLatest: true });
  }, [newBidTimestamp]);

  useEffect(() => {
    if (!id) return;
    api.get(`/ai/auctions/${id}/predicted-value`).then(({ data }) => setAiPredictedValue(data.value || '')).catch(() => {});
  }, [id]);

  const handleAutoBid = async (e) => {
    e.preventDefault();
    const max = Number(autoBidMax);
    if (!max || max < minBid) return;
    setAutoBidError('');
    setAutoBidDone('');
    try {
      await api.post(`/auctions/${id}/auto-bid`, { maxAmount: max, increment: Number(autoBidIncrement) || 50 });
      setAutoBidDone(myAutoBidConfig ? 'Auto-bid updated.' : 'Auto-bid set.');
      fetchMyAutoBid();
    } catch (err) {
      setAutoBidError(err.response?.data?.message || 'Failed');
    }
  };

  const handleRemoveAutoBid = async () => {
    setAutoBidError('');
    setAutoBidDone('');
    try {
      await api.delete(`/auctions/${id}/auto-bid`);
      setMyAutoBidConfig(null);
      setAutoBidMax('');
      setAutoBidIncrement('50');
      setAutoBidDone('Auto-bid removed.');
    } catch (err) {
      setAutoBidError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    setChatReply('');
    try {
      const { data } = await api.post(`/ai/auctions/${id}/chat`, { message: chatMessage.trim() });
      setChatReply(data.reply || '');
      setChatMessage('');
    } catch (err) {
      setChatReply('Failed to get reply.');
    } finally {
      setChatLoading(false);
    }
  };

  // Countdown updates at 5s interval to keep system stable (no sub-5s polling/interval)
  const COUNTDOWN_UPDATE_MS = 5000;
  useEffect(() => {
    if (!countdownEnd || ended) return;
    const tick = () => {
      const now = new Date();
      if (now >= countdownEnd) {
        setCountdown('Ended');
        setEnded(true);
        return;
      }
      const s = Math.max(0, Math.floor((countdownEnd - now) / 1000));
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      setCountdown(`${h}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`);
    };
    tick();
    const t = setInterval(tick, COUNTDOWN_UPDATE_MS);
    return () => clearInterval(t);
  }, [countdownEnd, ended, setEnded]);

  const minBid = auction ? (currentPrice ?? auction.currentPrice) + (auction.minIncrement || 10) : 0;

  const formatBidTime = (createdAt) => {
    if (!createdAt) return '—';
    const d = new Date(createdAt);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleBid = (e) => {
    e.preventDefault();
    const amt = Number(bidAmount);
    if (amt >= minBid && !ended) {
      placeBid(amt);
      setBidAmount('');
    }
  };

  if (loading || !auction) return <div className="page loading">Loading auction...</div>;

  const item = auction.item || {};
  const imageUrl = getImageUrl(item.image) ?? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=500&fit=crop';

  // Current highest bidder cannot place the next bid – someone else must bid first
  const currentHighestBidderId = latestBid?.bidder?._id?.toString() ?? latestBid?.bidder?.toString?.() ?? null;
  const userHasCurrentBid = user?._id && currentHighestBidderId && (user._id.toString() === currentHighestBidderId);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <Link to={user?.role === 'seller' ? '/seller' : '/bidder'} className="btn btn-ghost" style={{ marginBottom: '1.5rem' }}>← Back to dashboard</Link>

        <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '1.5rem' }}>
          <img src={imageUrl} alt={item.name} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
          <div style={{ padding: '1.5rem 2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>{item.name}</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>{item.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <span><strong>Base:</strong> Rs {auction.basePrice}</span>
              <span className="auction-price" style={{ fontSize: '1.5rem' }}>
                Rs {currentPrice ?? auction.currentPrice}
                {user?.role === 'bidder' && recommendedPrice != null && (currentPrice ?? auction.currentPrice) > recommendedPrice && (
                  <span style={{ marginLeft: '0.35rem', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 600 }}>
                    (+{Math.round((currentPrice ?? auction.currentPrice) - recommendedPrice)})
                  </span>
                )}
              </span>
              <span><strong>Min increment:</strong> Rs {auction.minIncrement || 10}</span>
            </div>
            {user?.role === 'bidder' && recommendedPrice != null && (
              <p style={{ color: 'var(--accent-light)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                <strong>Recommended price:</strong> Rs {recommendedPrice}
              </p>
            )}
            {aiPredictedValue && (
              <p style={{ color: 'var(--accent-light)', fontSize: '0.95rem', marginBottom: '0.5rem' }}><strong>AI predicted value:</strong> {aiPredictedValue}</p>
            )}
            {countdown !== null && (
              <p style={{ marginBottom: 0 }}>
                <strong>Time left:</strong>{' '}
                <span className={`countdown ${countdown === 'Ended' || (countdownEnd && (countdownEnd - Date.now()) < 60000) ? 'urgent' : ''}`}>
                  {countdown}
                </span>
              </p>
            )}
            {ended && <p className="msg-error" style={{ marginTop: '0.5rem' }}>Auction ended. No more bids.</p>}
          </div>
        </div>

        {user?.role === 'bidder' && !ended && (
          <>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Place bid</h3>
              {userHasCurrentBid ? (
                <p style={{ margin: 0, color: 'var(--accent-light)', fontSize: '0.95rem', padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: 'var(--radius)' }}>
                  You have the current bid. Wait for someone else to bid before you can place another bid.
                </p>
              ) : (
                <form onSubmit={handleBid} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                  {bidError && <p className="msg-error" style={{ width: '100%', marginBottom: 0 }}>{bidError}</p>}
                  <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
                    <label>Your bid (min Rs {minBid})</label>
                    <input type="number" min={minBid} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary">Place bid</button>
                </form>
              )}
            </div>
            <div className="card" style={{ marginBottom: '1rem', background: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.25)' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Auto-bid</h3>
              {myAutoBidConfig ? (
                <>
                  <p className="msg-success" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(34,197,94,0.1)' }}>
                    <strong>Auto-bid is set by you.</strong> Up to Rs {myAutoBidConfig.maxAmount}, step Rs {myAutoBidConfig.increment}. The app will outbid others automatically until your max.
                  </p>
                  <form onSubmit={handleAutoBid} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                    {autoBidError && <p className="msg-error" style={{ width: '100%', marginBottom: 0 }}>{autoBidError}</p>}
                    {autoBidDone && <p className="msg-success" style={{ width: '100%', marginBottom: 0 }}>{autoBidDone}</p>}
                    <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
                      <label>Max (Rs)</label>
                      <input type="number" min={minBid} value={autoBidMax} onChange={(e) => setAutoBidMax(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, minWidth: 80 }}>
                      <label>Step (Rs)</label>
                      <input type="number" min={1} value={autoBidIncrement} onChange={(e) => setAutoBidIncrement(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-ghost">Update auto-bid</button>
                    <button type="button" className="btn btn-ghost" onClick={handleRemoveAutoBid} style={{ color: 'var(--error)' }}>Remove auto-bid</button>
                  </form>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>App will bid for you up to your max amount when others outbid you.</p>
                  <form onSubmit={handleAutoBid} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                    {autoBidError && <p className="msg-error" style={{ width: '100%', marginBottom: 0 }}>{autoBidError}</p>}
                    {autoBidDone && <p className="msg-success" style={{ width: '100%', marginBottom: 0 }}>{autoBidDone}</p>}
                    <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
                      <label>Max (Rs)</label>
                      <input type="number" min={minBid} value={autoBidMax} onChange={(e) => setAutoBidMax(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, minWidth: 80 }}>
                      <label>Step (Rs)</label>
                      <input type="number" min={1} value={autoBidIncrement} onChange={(e) => setAutoBidIncrement(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-ghost">Set auto-bid</button>
                  </form>
                </>
              )}
            </div>
          </>
        )}

        {user && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>AI assistant (ask about this auction)</h3>
            <form onSubmit={handleChat} className="form-inline">
              <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="e.g. What is the current price?" className="input-flex" />
              <button type="submit" className="btn btn-primary" disabled={chatLoading}>{chatLoading ? '...' : 'Send'}</button>
            </form>
            {chatReply && <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{chatReply}</p>}
          </div>
        )}

        <h2 className="section-title">Bid history</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {bidsLoading ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading bids...</p>
          ) : (
            <>
              <ul className="bid-list">
                {bidsList.length === 0 && <li style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>No bids yet.</li>}
                {bidsList.map((b, i) => (
                  <li key={b._id || i} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                    <span>
                      <span className="bid-amount">Rs {b.amount}</span>
                      <span className="bid-auto">{b.isAutoBid ? ' (auto)' : ''}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{b.bidder?.name || b.bidder?.email || 'Unknown'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatBidTime(b.createdAt)}</span>
                  </li>
                ))}
              </ul>
              {bidsTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Page {bidsPage} of {bidsTotalPages} ({bidsTotal} total)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-ghost" disabled={bidsPage <= 1} onClick={() => setBidsPage((p) => Math.max(1, p - 1))}>Previous</button>
                    <button type="button" className="btn btn-ghost" disabled={bidsPage >= bidsTotalPages} onClick={() => setBidsPage((p) => Math.min(bidsTotalPages, p + 1))}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
