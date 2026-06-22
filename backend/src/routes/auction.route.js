const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const bidController = require('../controllers/bid.controller');
const autoBidController = require('../controllers/autoBid.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', auctionController.list);
router.get('/stats/seller', protect, requireRole('seller'), auctionController.sellerStats);
router.get('/:auctionId/recommended-price', protect, requireRole('bidder'), auctionController.getRecommendedPrice);
router.get('/:id', auctionController.getOne);
router.get('/:id/bids', bidController.listByAuction);
router.post('/', protect, requireRole('seller'), auctionController.create);
router.get('/:auctionId/auto-bid', protect, requireRole('bidder'), autoBidController.getMine);
router.post('/:auctionId/auto-bid', protect, requireRole('bidder'), autoBidController.upsert);
router.delete('/:auctionId/auto-bid', protect, requireRole('bidder'), autoBidController.remove);

module.exports = router;
