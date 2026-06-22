import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';

// Live updates: sockets only (no polling). Bids/price update only when server emits after a bid.

export function useAuctionRoom(auctionId) {
  const { token } = useAuth();
  const [currentPrice, setCurrentPrice] = useState(null);
  const [countdownEnd, setCountdownEnd] = useState(null);
  const [bidError, setBidError] = useState('');
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newBidTimestamp, setNewBidTimestamp] = useState(0);

  useEffect(() => {
    if (!auctionId) return;
    let mounted = true;
    api.get(`/auctions/${auctionId}`)
      .then(({ data }) => {
        if (!mounted) return;
        setCurrentPrice(data.auction.currentPrice);
        setCountdownEnd(data.auction.endTime ? new Date(data.auction.endTime) : null);
        setEnded(data.auction.status === 'ended');
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId || !token) return;
    const s = getSocket(token);
    if (!s) return;
    s.emit('join_auction', auctionId);
    const onBid = (payload) => {
      setNewBidTimestamp(Date.now());
      if (payload.bid?.amount) setCurrentPrice(payload.bid.amount);
    };
    const onPrice = (payload) => setCurrentPrice(payload.currentPrice);
    const onError = (payload) => setBidError(payload.message || 'Bid failed');
    const onEnded = () => setEnded(true);
    s.on('bid:new', onBid);
    s.on('auction:price', onPrice);
    s.on('bid_error', onError);
    s.on('auction:ended', onEnded);
    return () => {
      s.off('bid:new', onBid);
      s.off('auction:price', onPrice);
      s.off('bid_error', onError);
      s.off('auction:ended', onEnded);
    };
  }, [auctionId, token]);

  const placeBid = useCallback((amount) => {
    setBidError('');
    const s = getSocket(token);
    if (!s) return;
    s.emit('place_bid', { auctionId, amount });
  }, [auctionId, token]);

  return {
    currentPrice,
    countdownEnd,
    bidError,
    ended,
    loading,
    placeBid,
    setEnded,
    newBidTimestamp,
  };
}
