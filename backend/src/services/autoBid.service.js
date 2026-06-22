const Bid = require('../models/bid.model');
const Auction = require('../models/auction.model');
const AutoBidConfig = require('../models/autoBidConfig.model');

/**
 * After a bid is placed (or auto-bid is set/updated), check all active auto-bid configs
 * and place automatic bids. When someone else has the high bid, we place one bid at
 * currentPrice + that bidder's increment (capped by their max). The while-loop keeps
 * re-checking so that if multiple bidders have auto-bid, we chain: A outbids, then B's
 * auto-bid runs, then A's again, until no one can bid (at max or already highest).
 * Order: maxAmount desc, then createdAt asc.
 */
async function processAutoBids(auctionId, io) {
  const room = `auction:${auctionId}`;
  let auction = await Auction.findById(auctionId);
  if (!auction) return;
  const now = new Date();
  if (now > auction.endTime) return;

  const configs = await AutoBidConfig.find({ auction: auctionId, active: true })
    .populate('bidder', 'name email')
    .sort({ maxAmount: -1, createdAt: 1 });

  let changed = true;
  while (changed) {
    changed = false;
    auction = await Auction.findById(auctionId);
    if (now > auction.endTime) break;
    const minBid = auction.currentPrice + (auction.minIncrement || 10);

    const lastBid = await Bid.findOne({ auction: auctionId }).sort({ createdAt: -1 }).select('bidder').lean();
    const currentHighestBidderId = lastBid?.bidder?.toString?.() ?? null;

    for (const config of configs) {
      if (currentHighestBidderId && config.bidder._id.toString() === currentHighestBidderId) continue;
      // Bid at least currentPrice + user's increment, but not below auction min
      const nextBid = Math.max(auction.currentPrice + config.increment, minBid);
      if (nextBid > config.maxAmount) continue;
      // Place auto-bid
      const bid = await Bid.create({
        auction: auctionId,
        bidder: config.bidder._id,
        amount: nextBid,
        isAutoBid: true,
      });
      await auction.updateOne({ currentPrice: nextBid });
      changed = true;
      io.to(room).emit('bid:new', {
        bid: { ...bid.toObject(), bidder: config.bidder },
        bidder: config.bidder,
        isAutoBid: true,
      });
      io.to(room).emit('auction:price', { currentPrice: nextBid });
      break; // one auto-bid per round, then re-check
    }
  }
}

module.exports = { processAutoBids };
