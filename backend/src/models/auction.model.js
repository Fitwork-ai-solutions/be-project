const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    basePrice: { type: Number, required: true, min: 0 }, // Rs
    currentPrice: { type: Number, required: true, min: 0 }, // Rs
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
    minIncrement: { type: Number, default: 10 }, // Rs
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recommendedPrice: { type: Number, default: null }, // Rs, set by Gemini from past history + base/category
  },
  { timestamps: true }
);

auctionSchema.index({ status: 1 });
auctionSchema.index({ endTime: 1 });
auctionSchema.index({ createdAt: -1 });

const Auction = mongoose.model('Auction', auctionSchema);
module.exports = Auction;
