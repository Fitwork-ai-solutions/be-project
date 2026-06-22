const express = require('express');
const router = express.Router();

// Mount route modules as they are created
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/items', itemRoutes);
// router.use('/auctions', auctionRoutes);
// router.use('/bids', bidRoutes);
// router.use('/ai', aiRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'Auction API v1' });
});

module.exports = router;
