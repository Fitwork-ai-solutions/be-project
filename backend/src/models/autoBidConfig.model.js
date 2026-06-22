const mongoose = require('mongoose');

const autoBidConfigSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxAmount: { type: Number, required: true, min: 0 }, // Rs
    increment: { type: Number, required: true, min: 1, default: 50 }, // Rs
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

autoBidConfigSchema.index({ auction: 1, bidder: 1 }, { unique: true });

const AutoBidConfig = mongoose.model('AutoBidConfig', autoBidConfigSchema);
module.exports = AutoBidConfig;
