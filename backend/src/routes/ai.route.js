const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/recommend', protect, requireRole('bidder'), aiController.recommend);
router.get('/auctions/:auctionId/predicted-value', aiController.predictedValue);
router.post('/auctions/:auctionId/chat', protect, aiController.chat);

module.exports = router;
