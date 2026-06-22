const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

const app = express();

// CORS
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static: serve uploaded files from public/
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Auction API' });
});

// API routes
const apiRoutes = require('./routes');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');
const itemRoutes = require('./routes/item.route');
const auctionRoutes = require('./routes/auction.route');
const aiRoutes = require('./routes/ai.route');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Error handler (multer + ApiError)
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }
  if (err.message && err.message.includes('Only images')) {
    return res.status(400).json({ message: err.message });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
