const gemini = require('../services/gemini.service');
const ApiError = require('../utils/ApiError');
const Auction = require('../models/auction.model');
const Bid = require('../models/bid.model');

exports.recommend = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ recommendations: 'Gemini API key not set. Add sample: Suggested: Sample Item Rs 500 (70% success chance)' });
    }
    const userId = req.user?._id;
    const bids = await Bid.find({ bidder: userId }).populate('auction').limit(20);
    const auctions = await Auction.find({ status: 'live' }).populate('item').limit(10).lean();
    const userContext = {
      myRecentBids: bids.map((b) => ({ amount: b.amount, item: b.auction?.item?.name })),
      liveAuctions: auctions.map((a) => ({ name: a.item?.name, currentPrice: a.currentPrice, category: a.item?.category })),
    };
    const text = await gemini.recommend(userContext);
    res.json({ recommendations: text });
  } catch (err) {
    next(err);
  }
};

exports.predictedValue = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId).populate('item').lean();
    if (!auction) throw new ApiError(404, 'Auction not found');
    const context = {
      itemName: auction.item?.name,
      category: auction.item?.category,
      basePrice: auction.basePrice,
      currentPrice: auction.currentPrice,
    };
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ value: `AI predicted value: Rs ${auction.basePrice} - Rs ${auction.currentPrice + 500} (placeholder)` });
    }
    const text = await gemini.predictedValue(context);
    res.json({ value: text });
  } catch (err) {
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) throw new ApiError(400, 'Message required');
    const auction = await Auction.findById(auctionId).populate('item').lean();
    if (!auction) throw new ApiError(404, 'Auction not found');
    const context = {
      itemName: auction.item?.name,
      basePrice: auction.basePrice,
      currentPrice: auction.currentPrice,
      startTime: auction.startTime,
      endTime: auction.endTime,
      status: auction.status,
    };
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: 'Sorry, AI is not configured. Ask: "What is the current price?"' });
    }
    const reply = await gemini.chat(message.trim(), context);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
