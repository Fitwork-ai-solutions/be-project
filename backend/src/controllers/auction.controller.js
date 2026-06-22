const Auction = require('../models/auction.model');
const Item = require('../models/item.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const gemini = require('../services/gemini.service');

function updateAuctionStatus(auction) {
  const now = new Date();
  if (now < auction.startTime) return 'scheduled';
  if (now > auction.endTime) return 'ended';
  return 'live';
}

exports.create = async (req, res, next) => {
  try {
    const { item, basePrice, startTime, endTime, minIncrement } = req.body;
    if (!item || basePrice == null || !startTime || !endTime) {
      throw new ApiError(400, 'Item, basePrice, startTime and endTime are required');
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) throw new ApiError(400, 'endTime must be after startTime');
    if (basePrice < 0) throw new ApiError(400, 'basePrice must be >= 0');

    const status = updateAuctionStatus({ startTime: start, endTime: end });
    const auction = await Auction.create({
      item,
      seller: req.user._id,
      basePrice: Number(basePrice),
      currentPrice: Number(basePrice),
      startTime: start,
      endTime: end,
      minIncrement: Number(minIncrement) || 10,
      status,
    });
    await auction.populate('item');
    await auction.populate('seller', 'name email');
    res.status(201).json({ auction });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { status, category, trending, seller } = req.query;
    const filter = {};
    if (category) filter['item.category'] = category;
    if (seller) filter.seller = seller;

    const auctions = await Auction.find(filter)
      .populate({ path: 'item', populate: { path: 'category', select: 'name slug' } })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const withStatus = auctions.map((a) => {
      if (now < new Date(a.startTime)) a.status = 'scheduled';
      else if (now > new Date(a.endTime)) a.status = 'ended';
      else a.status = 'live';
      return a;
    });
    let result = withStatus;
    if (status) result = result.filter((a) => a.status === status);
    if (category) result = result.filter((a) => a.item && a.item.category?._id?.toString() === category);
    res.json({ auctions: result });
  } catch (err) {
    next(err);
  }
};

/** Seller-only: stats per auction for charts (bid counts manual/auto, base/current price). */
exports.sellerStats = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const stats = await Auction.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'auction',
          as: 'bids',
        },
      },
      {
        $project: {
          item: 1,
          basePrice: 1,
          currentPrice: 1,
          manualBids: {
            $size: {
              $filter: {
                input: '$bids',
                as: 'b',
                cond: { $eq: ['$$b.isAutoBid', false] },
              },
            },
          },
          autoBids: {
            $size: {
              $filter: {
                input: '$bids',
                as: 'b',
                cond: { $eq: ['$$b.isAutoBid', true] },
              },
            },
          },
          totalBids: { $size: '$bids' },
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: 'item',
          foreignField: '_id',
          as: 'itemDoc',
        },
      },
      { $unwind: { path: '$itemDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          itemName: { $ifNull: ['$itemDoc.name', 'Unknown item'] },
          basePrice: 1,
          currentPrice: 1,
          manualBids: 1,
          autoBids: 1,
          totalBids: 1,
        },
      },
      { $sort: { totalBids: -1, currentPrice: -1 } },
    ]);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

/** Bidder-only: get or generate recommended price (Gemini) from base + category + past history; save to auction. */
exports.getRecommendedPrice = async (req, res, next) => {
  try {
    const auctionId = req.params.auctionId;
    let auction = await Auction.findById(auctionId)
      .populate({ path: 'item', populate: { path: 'category', select: 'name slug' } });
    if (!auction) throw new ApiError(404, 'Auction not found');
    if (auction.recommendedPrice != null) {
      return res.json({ recommendedPrice: auction.recommendedPrice });
    }
    const categoryId = auction.item?.category?._id;
    let pastData = [];
    if (categoryId) {
      const itemIds = await Item.find({ category: categoryId }).select('_id').lean().then((r) => r.map((i) => i._id));
      const pastAuctions = await Auction.find({
        _id: { $ne: auctionId },
        item: { $in: itemIds },
        endTime: { $lt: new Date() },
      })
        .select('basePrice currentPrice')
        .lean();
      pastData = pastAuctions.map((a) => ({ basePrice: a.basePrice, finalPrice: a.currentPrice }));
    }
    const recommendedPrice = await gemini.getRecommendedPrice({
      itemName: auction.item?.name || 'Item',
      categoryName: auction.item?.category?.name || 'General',
      basePrice: auction.basePrice,
      pastAuctions: pastData,
    });
    auction.recommendedPrice = recommendedPrice;
    await auction.save();
    res.json({ recommendedPrice });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('item')
      .populate('seller', 'name email')
      .populate('winner', 'name email');
    if (!auction) throw new ApiError(404, 'Auction not found');
    const status = updateAuctionStatus(auction);
    if (auction.status !== status) {
      auction.status = status;
      await auction.save();
    }
    await auction.populate({ path: 'item', populate: { path: 'category', select: 'name slug' } });
    res.json({ auction });
  } catch (err) {
    next(err);
  }
};
