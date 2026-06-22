const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Auction = require('../models/auction.model');
const Bid = require('../models/bid.model');
const config = require('../config/env');
const { processAutoBids } = require('../services/autoBid.service');

// Emit only on events (place_bid, auto-bid). No interval-based polling or broadcast.

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: config.clientUrl, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Not authenticated'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id email role name');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
    });

    socket.on('place_bid', async (payload) => {
      const { auctionId, amount } = payload || {};
      if (!auctionId || amount == null) {
        socket.emit('bid_error', { message: 'auctionId and amount required' });
        return;
      }
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        socket.emit('bid_error', { message: 'Invalid amount' });
        return;
      }

      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) {
          socket.emit('bid_error', { message: 'Auction not found' });
          return;
        }
        if (auction.status === 'ended') {
          socket.emit('bid_error', { message: 'Auction has ended' });
          return;
        }
        const now = new Date();
        if (now < auction.startTime) {
          socket.emit('bid_error', { message: 'Auction has not started' });
          return;
        }
        if (now > auction.endTime) {
          socket.emit('bid_error', { message: 'Auction has ended' });
          return;
        }
        const minBid = auction.currentPrice + (auction.minIncrement || 10);
        if (numAmount < minBid) {
          socket.emit('bid_error', { message: `Minimum bid is Rs ${minBid}` });
          return;
        }

        // Current highest bidder cannot place the next bid – someone else must bid first
        const lastBid = await Bid.findOne({ auction: auctionId }).sort({ createdAt: -1 }).select('bidder').lean();
        if (lastBid && lastBid.bidder && lastBid.bidder.toString() === socket.user._id.toString()) {
          socket.emit('bid_error', { message: 'You already have the current bid. Wait for someone else to bid before you can bid again.' });
          return;
        }

        const bid = await Bid.create({
          auction: auctionId,
          bidder: socket.user._id,
          amount: numAmount,
          isAutoBid: false,
        });
        await bid.populate('bidder', 'name email');
        await Auction.findByIdAndUpdate(auctionId, {
          currentPrice: numAmount,
          status: now > auction.endTime ? 'ended' : 'live',
        });

        const room = `auction:${auctionId}`;
        io.to(room).emit('bid:new', { bid: bid.toObject(), bidder: bid.bidder });
        io.to(room).emit('auction:price', { currentPrice: numAmount });
        await processAutoBids(auctionId, io);
      } catch (err) {
        console.error('place_bid error', err);
        socket.emit('bid_error', { message: err.message || 'Bid failed' });
      }
    });
  });

  return io;
}

module.exports = { initSocket };
