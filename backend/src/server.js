require('dotenv').config();
const http = require('http');
const connectDB = require('./config/db');
const config = require('./config/env');
const app = require('./app');

connectDB();

const server = http.createServer(app);
const { initSocket } = require('./socket');
const { startAuctionCron } = require('./jobs/auctionCron');

const io = initSocket(server);
app.set('io', io);

startAuctionCron(io);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
