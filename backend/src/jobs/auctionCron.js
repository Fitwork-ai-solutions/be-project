const cron = require('node-cron');
const Auction = require('../models/auction.model');
const Bid = require('../models/bid.model');

function startAuctionCron(io) {
  // Runs every minute — finds live/scheduled auctions past their endTime,
  // marks them ended, assigns winner (last/highest bidder), and notifies the room.
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const expired = await Auction.find({
        endTime: { $lt: now },
        status: { $ne: 'ended' },
      }).lean();

      for (const auction of expired) {
        const lastBid = await Bid.findOne({ auction: auction._id })
          .sort({ createdAt: -1 })
          .populate('bidder', 'name email')
          .lean();

        const winner = lastBid?.bidder ?? null;

        await Auction.findByIdAndUpdate(auction._id, {
          status: 'ended',
          ...(winner && { winner: winner._id }),
        });

        if (io) {
          io.to(`auction:${auction._id}`).emit('auction:ended', {
            auctionId: auction._id,
            winner: winner
              ? { _id: winner._id, name: winner.name, email: winner.email }
              : null,
            finalPrice: auction.currentPrice,
          });
        }
      }
    } catch (err) {
      console.error('[auctionCron] error:', err.message);
    }
  });

  console.log('[auctionCron] started — checking every minute');
}

module.exports = { startAuctionCron };
