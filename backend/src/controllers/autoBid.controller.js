const AutoBidConfig = require('../models/autoBidConfig.model');
const ApiError = require('../utils/ApiError');
const Auction = require('../models/auction.model');
const { processAutoBids } = require('../services/autoBid.service');

/** Get current user's auto-bid config for this auction (bidder only). */
exports.getMine = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const config = await AutoBidConfig.findOne({
      auction: auctionId,
      bidder: req.user._id,
      active: true,
    }).lean();
    res.json({ config: config || null });
  } catch (err) {
    next(err);
  }
};

exports.upsert = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { maxAmount, increment } = req.body;
    if (maxAmount == null || maxAmount < 0) throw new ApiError(400, 'maxAmount is required and must be >= 0');
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new ApiError(404, 'Auction not found');
    if (auction.seller.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'Seller cannot set auto-bid on own auction');
    }
    const config = await AutoBidConfig.findOneAndUpdate(
      { auction: auctionId, bidder: req.user._id },
      { maxAmount: Number(maxAmount), increment: Number(increment) || 50, active: true },
      { new: true, upsert: true }
    );
    await config.populate('auction', 'currentPrice minIncrement');
    const io = req.app.get('io');
    if (io) processAutoBids(auctionId, io).catch((err) => console.error('processAutoBids after upsert', err));
    res.json({ config });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const config = await AutoBidConfig.findOneAndUpdate(
      { auction: auctionId, bidder: req.user._id },
      { active: false },
      { new: true }
    );
    if (!config) throw new ApiError(404, 'Auto-bid config not found');
    res.json({ message: 'Auto-bid removed' });
  } catch (err) {
    next(err);
  }
};
