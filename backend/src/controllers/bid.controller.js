const Bid = require('../models/bid.model');
const Auction = require('../models/auction.model');
const ApiError = require('../utils/ApiError');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

exports.listByAuction = async (req, res, next) => {
  try {
    const auctionId = req.params.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      Bid.find({ auction: auctionId })
        .populate('bidder', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bid.countDocuments({ auction: auctionId }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.json({ bids, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
};
