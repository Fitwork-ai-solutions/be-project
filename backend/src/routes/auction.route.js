const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const bidController = require('../controllers/bid.controller');
const autoBidController = require('../controllers/autoBid.controller');
const { protect, requireRole } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', auctionController.list);
router.get('/stats/seller', protect, requireRole('seller'), auctionController.sellerStats);
router.get('/:auctionId/recommended-price', validateObjectId('auctionId'), protect, requireRole('bidder'), auctionController.getRecommendedPrice);
router.get('/:id', validateObjectId('id'), auctionController.getOne);
router.get('/:id/bids', validateObjectId('id'), bidController.listByAuction);
router.post('/', protect, requireRole('seller'), auctionController.create);
router.get('/:auctionId/auto-bid', validateObjectId('auctionId'), protect, requireRole('bidder'), autoBidController.getMine);
router.post('/:auctionId/auto-bid', validateObjectId('auctionId'), protect, requireRole('bidder'), autoBidController.upsert);
router.delete('/:auctionId/auto-bid', validateObjectId('auctionId'), protect, requireRole('bidder'), autoBidController.remove);

module.exports = router;
