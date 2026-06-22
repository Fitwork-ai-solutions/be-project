const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 }, // Rs
    isAutoBid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bidSchema.index({ auction: 1, createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
