require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/user.model');
const Category = require('./models/category.model');
const Item = require('./models/item.model');
const Auction = require('./models/auction.model');
const Bid = require('./models/bid.model');

const now = new Date();
const h = (hrs) => new Date(now.getTime() + hrs * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Wipe existing seed data cleanly
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Item.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Users ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('demo1234', 10);

  const [seller, bidder1, bidder2] = await User.insertMany([
    {
      name: 'Raj Electronics',
      email: 'seller@auction.com',
      password: hashedPassword,
      role: 'seller',
      mobile: '9876543210',
      address: 'Pune, Maharashtra',
      age: 35,
    },
    {
      name: 'Priya Sharma',
      email: 'bidder1@auction.com',
      password: hashedPassword,
      role: 'bidder',
      mobile: '9123456780',
      address: 'Mumbai, Maharashtra',
      age: 28,
    },
    {
      name: 'Amit Patel',
      email: 'bidder2@auction.com',
      password: hashedPassword,
      role: 'bidder',
      mobile: '9012345678',
      address: 'Nashik, Maharashtra',
      age: 32,
    },
  ]);
  console.log('Created users');

  // ── Categories ─────────────────────────────────────────
  const [electronics, fashion, books, art, home] = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    { name: 'Books & Education', slug: 'books-education' },
    { name: 'Art & Collectibles', slug: 'art-collectibles' },
    { name: 'Home & Garden', slug: 'home-garden' },
  ]);
  console.log('Created categories');

  // ── Items ──────────────────────────────────────────────
  const [
    iphone, headphones, macbook, saree,
    jacket, statue, painting, keyboard,
  ] = await Item.insertMany([
    {
      name: 'iPhone 14 Pro',
      description: 'Apple iPhone 14 Pro 256GB Deep Purple. Sealed box, never opened. 1 year warranty included.',
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Industry-leading noise cancellation. 30-hour battery life. Comes with original carry case.',
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'MacBook Air M2',
      description: 'Apple MacBook Air M2 chip, 8GB RAM, 256GB SSD. Midnight colour. 6 months old, excellent condition.',
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Handmade Banarasi Silk Saree',
      description: 'Pure Banarasi silk saree with gold zari work. Unstitched blouse piece included. Wedding collection.',
      category: fashion._id,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Vintage Leather Jacket',
      description: 'Genuine leather jacket from the 1980s. Size L. Excellent vintage condition with classic brass zippers.',
      category: fashion._id,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Antique Bronze Ganesh Statue',
      description: '200-year-old handcrafted bronze Ganesha. Height 14 inches. Museum-quality piece with authenticity certificate.',
      category: art._id,
      image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Oil Painting — Konkan Sunset',
      description: 'Original oil on canvas by Pune artist. 24x36 inches. Signed and dated 2019. Certificate of authenticity included.',
      category: art._id,
      image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=600&fit=crop',
      seller: seller._id,
    },
    {
      name: 'Keychron K2 Mechanical Keyboard',
      description: 'Wireless mechanical keyboard with RGB backlight. Brown switches. Compatible with Mac and Windows.',
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=600&fit=crop',
      seller: seller._id,
    },
  ]);
  console.log('Created items');

  // ── Auctions ───────────────────────────────────────────
  // Live: startTime in past, endTime in future
  // Scheduled: startTime in future
  // Ended: endTime in past

  const [
    aIphone, aHeadphones, aMacbook, aSaree,
    aJacket, aStatue, aPainting, aKeyboard,
  ] = await Auction.insertMany([
    // LIVE auctions
    {
      item: iphone._id, seller: seller._id,
      basePrice: 45000, currentPrice: 52500,
      startTime: h(-6), endTime: h(18),
      minIncrement: 500, status: 'live',
    },
    {
      item: headphones._id, seller: seller._id,
      basePrice: 15000, currentPrice: 17200,
      startTime: h(-3), endTime: h(21),
      minIncrement: 200, status: 'live',
    },
    {
      item: macbook._id, seller: seller._id,
      basePrice: 85000, currentPrice: 91000,
      startTime: h(-1), endTime: h(47),
      minIncrement: 1000, status: 'live',
    },
    {
      item: saree._id, seller: seller._id,
      basePrice: 8000, currentPrice: 9400,
      startTime: h(-2), endTime: h(22),
      minIncrement: 200, status: 'live',
    },
    // SCHEDULED auctions
    {
      item: jacket._id, seller: seller._id,
      basePrice: 12000, currentPrice: 12000,
      startTime: h(26), endTime: h(74),
      minIncrement: 300, status: 'scheduled',
    },
    {
      item: statue._id, seller: seller._id,
      basePrice: 35000, currentPrice: 35000,
      startTime: h(50), endTime: h(98),
      minIncrement: 500, status: 'scheduled',
    },
    // ENDED auctions
    {
      item: painting._id, seller: seller._id,
      basePrice: 18000, currentPrice: 24500,
      startTime: h(-72), endTime: h(-24),
      minIncrement: 500, status: 'ended',
      winner: bidder1._id,
    },
    {
      item: keyboard._id, seller: seller._id,
      basePrice: 6500, currentPrice: 8200,
      startTime: h(-96), endTime: h(-48),
      minIncrement: 100, status: 'ended',
      winner: bidder2._id,
    },
  ]);
  console.log('Created auctions');

  // ── Bids ───────────────────────────────────────────────
  // Live auction bids (realistic bidding history)
  await Bid.insertMany([
    // iPhone bids
    { auction: aIphone._id, bidder: bidder1._id, amount: 46000, isAutoBid: false, createdAt: h(-5.5) },
    { auction: aIphone._id, bidder: bidder2._id, amount: 47500, isAutoBid: false, createdAt: h(-4) },
    { auction: aIphone._id, bidder: bidder1._id, amount: 49000, isAutoBid: true,  createdAt: h(-3.5) },
    { auction: aIphone._id, bidder: bidder2._id, amount: 50500, isAutoBid: false, createdAt: h(-2) },
    { auction: aIphone._id, bidder: bidder1._id, amount: 52500, isAutoBid: true,  createdAt: h(-1) },

    // Headphones bids
    { auction: aHeadphones._id, bidder: bidder2._id, amount: 15500, isAutoBid: false, createdAt: h(-2.5) },
    { auction: aHeadphones._id, bidder: bidder1._id, amount: 16000, isAutoBid: false, createdAt: h(-2) },
    { auction: aHeadphones._id, bidder: bidder2._id, amount: 17200, isAutoBid: false, createdAt: h(-0.5) },

    // MacBook bids
    { auction: aMacbook._id, bidder: bidder1._id, amount: 87000, isAutoBid: false, createdAt: h(-0.8) },
    { auction: aMacbook._id, bidder: bidder2._id, amount: 91000, isAutoBid: false, createdAt: h(-0.3) },

    // Saree bids
    { auction: aSaree._id, bidder: bidder1._id, amount: 8500,  isAutoBid: false, createdAt: h(-1.5) },
    { auction: aSaree._id, bidder: bidder2._id, amount: 9000,  isAutoBid: false, createdAt: h(-1) },
    { auction: aSaree._id, bidder: bidder1._id, amount: 9400,  isAutoBid: false, createdAt: h(-0.2) },

    // Ended auction bids (painting)
    { auction: aPainting._id, bidder: bidder2._id, amount: 19000, isAutoBid: false, createdAt: h(-70) },
    { auction: aPainting._id, bidder: bidder1._id, amount: 20500, isAutoBid: false, createdAt: h(-60) },
    { auction: aPainting._id, bidder: bidder2._id, amount: 22000, isAutoBid: false, createdAt: h(-48) },
    { auction: aPainting._id, bidder: bidder1._id, amount: 24500, isAutoBid: false, createdAt: h(-25) },

    // Ended auction bids (keyboard)
    { auction: aKeyboard._id, bidder: bidder1._id, amount: 6800,  isAutoBid: false, createdAt: h(-90) },
    { auction: aKeyboard._id, bidder: bidder2._id, amount: 7300,  isAutoBid: false, createdAt: h(-80) },
    { auction: aKeyboard._id, bidder: bidder1._id, amount: 7800,  isAutoBid: true,  createdAt: h(-70) },
    { auction: aKeyboard._id, bidder: bidder2._id, amount: 8200,  isAutoBid: false, createdAt: h(-50) },
  ]);
  console.log('Created bids');

  console.log('\n✅ Seed complete!\n');
  console.log('──────────────────────────────────────');
  console.log('Demo accounts (password: demo1234)');
  console.log('  Seller : seller@auction.com');
  console.log('  Bidder1: bidder1@auction.com');
  console.log('  Bidder2: bidder2@auction.com');
  console.log('──────────────────────────────────────');
  console.log('Data created:');
  console.log('  5 categories');
  console.log('  8 items');
  console.log('  4 live auctions, 2 scheduled, 2 ended');
  console.log('  21 bids across all auctions');
  console.log('──────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
