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
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Item.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ── Password ───────────────────────────────────────────
  const pw = await bcrypt.hash('demo1234', 10);

  // ── Users: 5 sellers + 15 bidders ─────────────────────
  const [s1, s2, s3, s4, s5,
         b1, b2, b3, b4, b5,
         b6, b7, b8, b9, b10,
         b11, b12, b13, b14, b15] = await User.insertMany([
    // Sellers
    { name: 'Raj Electronics',     email: 'seller1@auction.com', password: pw, role: 'seller', mobile: '9876543210', address: 'Pune, Maharashtra',    age: 35 },
    { name: 'Meera Collectibles',  email: 'seller2@auction.com', password: pw, role: 'seller', mobile: '9765432109', address: 'Jaipur, Rajasthan',     age: 42 },
    { name: 'Arjun Fashion House', email: 'seller3@auction.com', password: pw, role: 'seller', mobile: '9654321098', address: 'Surat, Gujarat',        age: 38 },
    { name: 'Sunita Books & Art',  email: 'seller4@auction.com', password: pw, role: 'seller', mobile: '9543210987', address: 'Kolkata, West Bengal',  age: 50 },
    { name: 'Vikram Auto Parts',   email: 'seller5@auction.com', password: pw, role: 'seller', mobile: '9432109876', address: 'Chennai, Tamil Nadu',   age: 44 },
    // Bidders
    { name: 'Priya Sharma',        email: 'bidder1@auction.com',  password: pw, role: 'bidder', mobile: '9123456780', address: 'Mumbai, Maharashtra',   age: 28 },
    { name: 'Amit Patel',          email: 'bidder2@auction.com',  password: pw, role: 'bidder', mobile: '9012345678', address: 'Nashik, Maharashtra',   age: 32 },
    { name: 'Sneha Kulkarni',      email: 'bidder3@auction.com',  password: pw, role: 'bidder', mobile: '8901234567', address: 'Nagpur, Maharashtra',   age: 26 },
    { name: 'Rahul Verma',         email: 'bidder4@auction.com',  password: pw, role: 'bidder', mobile: '8890123456', address: 'Delhi, Delhi',          age: 30 },
    { name: 'Ananya Iyer',         email: 'bidder5@auction.com',  password: pw, role: 'bidder', mobile: '8789012345', address: 'Bangalore, Karnataka',  age: 27 },
    { name: 'Karan Singh',         email: 'bidder6@auction.com',  password: pw, role: 'bidder', mobile: '8678901234', address: 'Hyderabad, Telangana',  age: 34 },
    { name: 'Deepa Nair',          email: 'bidder7@auction.com',  password: pw, role: 'bidder', mobile: '8567890123', address: 'Kochi, Kerala',         age: 29 },
    { name: 'Rohit Gupta',         email: 'bidder8@auction.com',  password: pw, role: 'bidder', mobile: '8456789012', address: 'Ahmedabad, Gujarat',    age: 36 },
    { name: 'Kavitha Reddy',       email: 'bidder9@auction.com',  password: pw, role: 'bidder', mobile: '8345678901', address: 'Vizag, AP',             age: 31 },
    { name: 'Nikhil Joshi',        email: 'bidder10@auction.com', password: pw, role: 'bidder', mobile: '8234567890', address: 'Indore, MP',            age: 25 },
    { name: 'Pooja Mehta',         email: 'bidder11@auction.com', password: pw, role: 'bidder', mobile: '8123456789', address: 'Bhopal, MP',            age: 33 },
    { name: 'Suresh Babu',         email: 'bidder12@auction.com', password: pw, role: 'bidder', mobile: '8012345678', address: 'Coimbatore, TN',        age: 40 },
    { name: 'Divya Pillai',        email: 'bidder13@auction.com', password: pw, role: 'bidder', mobile: '7901234567', address: 'Thiruvananthapuram, KL', age: 23 },
    { name: 'Manish Tiwari',       email: 'bidder14@auction.com', password: pw, role: 'bidder', mobile: '7890123456', address: 'Lucknow, UP',           age: 37 },
    { name: 'Lakshmi Devi',        email: 'bidder15@auction.com', password: pw, role: 'bidder', mobile: '7789012345', address: 'Patna, Bihar',          age: 45 },
  ]);
  console.log('Created 20 users (5 sellers + 15 bidders)');

  // ── Categories (10) ────────────────────────────────────
  const [electronics, fashion, books, art, home,
         sports, vehicles, jewellery, furniture, music] = await Category.insertMany([
    { name: 'Electronics',          slug: 'electronics' },
    { name: 'Fashion & Clothing',   slug: 'fashion-clothing' },
    { name: 'Books & Education',    slug: 'books-education' },
    { name: 'Art & Collectibles',   slug: 'art-collectibles' },
    { name: 'Home & Garden',        slug: 'home-garden' },
    { name: 'Sports & Fitness',     slug: 'sports-fitness' },
    { name: 'Vehicles & Parts',     slug: 'vehicles-parts' },
    { name: 'Jewellery & Watches',  slug: 'jewellery-watches' },
    { name: 'Furniture & Decor',    slug: 'furniture-decor' },
    { name: 'Musical Instruments',  slug: 'musical-instruments' },
  ]);
  console.log('Created 10 categories');

  // ── Items (30) ─────────────────────────────────────────
  const items = await Item.insertMany([
    // Electronics (s1)
    { name: 'iPhone 15 Pro Max',          description: 'Apple iPhone 15 Pro Max 256GB Natural Titanium. Sealed box, 1-year warranty.',            category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop' },
    { name: 'Sony WH-1000XM5',            description: 'Industry-leading noise cancellation headphones. 30hr battery. Original carry case.',      category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop' },
    { name: 'MacBook Air M3',             description: 'Apple MacBook Air M3, 16GB RAM, 512GB SSD. Midnight. 3 months old, mint condition.',      category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop' },
    { name: 'Samsung 65" QLED TV',        description: 'Samsung QN65Q80C 65-inch QLED 4K Smart TV. 1 year old, perfect working condition.',       category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&h=600&fit=crop' },
    { name: 'DJI Mini 4 Pro Drone',       description: 'DJI Mini 4 Pro with RC 2 controller. 3 batteries included. Less than 5 hours fly time.',  category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&h=600&fit=crop' },
    { name: 'Canon EOS R6 Mark II',       description: 'Full-frame mirrorless camera body only. Shutter count < 2000. With original accessories.', category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop' },

    // Fashion (s3)
    { name: 'Handmade Banarasi Silk Saree', description: 'Pure Banarasi silk saree with gold zari work. Unstitched blouse piece included. Wedding collection.', category: fashion._id, seller: s3._id, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop' },
    { name: 'Vintage Leather Jacket',     description: 'Genuine leather jacket from the 1980s. Size L. Excellent vintage condition with classic brass zippers.', category: fashion._id, seller: s3._id, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop' },
    { name: 'Louis Vuitton Neverfull MM', description: 'Authentic LV Neverfull MM in Monogram canvas. Includes dustbag and receipt. 2022 purchase.',            category: fashion._id, seller: s3._id, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop' },
    { name: 'Pashmina Shawl — Kashmiri',  description: 'Handwoven pure Pashmina shawl from Kashmir. GI tagged. Traditional embroidery.',                        category: fashion._id, seller: s3._id, image: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=800&h=600&fit=crop' },

    // Art & Collectibles (s2)
    { name: 'Antique Bronze Ganesh Statue', description: '200-year-old handcrafted bronze Ganesha. 14 inches height. Museum-quality. Authenticity certificate.', category: art._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&h=600&fit=crop' },
    { name: 'Oil Painting — Konkan Sunset', description: 'Original oil on canvas by Pune artist. 24×36 inches. Signed 2019. Certificate of authenticity.',       category: art._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=600&fit=crop' },
    { name: 'Mughal Miniature Painting',    description: 'Original 19th-century Mughal miniature on ivory. 6×9 inches. Collector\'s item with provenance.',       category: art._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop' },
    { name: 'First Edition — Panchatantra', description: 'Rare first Indian edition of Panchatantra (1930). Excellent condition. Bookplate intact.',               category: books._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop' },

    // Home & Garden (s2)
    { name: 'Rajasthani Hand-painted Wardrobe', description: '3-door wooden wardrobe hand-painted with Rajasthani motifs. Solid sheesham wood. 6ft tall.', category: furniture._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop' },
    { name: 'Persian Silk Carpet 8×10ft',       description: 'Handwoven Persian silk carpet. 400 KPSI. Floral pattern. Imported from Iran. Certificate.',   category: home._id,      seller: s2._id, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop' },

    // Jewellery (s2)
    { name: '22K Gold Necklace Set',     description: 'BIS hallmarked 22K gold necklace with earrings. 35 grams. Traditional temple design. Box included.', category: jewellery._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop' },
    { name: 'Vintage Omega Seamaster',   description: 'Vintage Omega Seamaster 300 (1968). Cal. 269 movement. Serviced 2023. Original bracelet.',            category: jewellery._id, seller: s2._id, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop' },

    // Sports (s5)
    { name: 'Yonex Arcsaber 11 Pro',   description: 'Professional badminton racket. Used in 3 tournaments. Repaired grip. 4U weight.',                    category: sports._id, seller: s5._id, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop' },
    { name: 'Trek Marlin 7 Mountain Bike', description: '29" mountain bike. Hydraulic disc brakes. 1×12 drivetrain. 2022 model. 200km ridden.',          category: sports._id, seller: s5._id, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
    { name: 'Fitbit Sense 2 Smartwatch', description: 'Health-focused smartwatch. ECG, SpO2, stress tracking. Worn 6 months. All accessories included.', category: sports._id, seller: s5._id, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=600&fit=crop' },

    // Vehicles (s5)
    { name: 'Royal Enfield Classic 350 Parts Kit', description: 'Genuine RE Classic 350 engine rebuild kit (2018-22). Pistons, gaskets, bearings. Unused.', category: vehicles._id, seller: s5._id, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop' },
    { name: 'Vintage Vespa Sprint 150',             description: '1972 Vespa Sprint 150. Fully restored. New paint, new seat cover, engine overhauled.',    category: vehicles._id, seller: s5._id, image: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&h=600&fit=crop' },

    // Musical Instruments (s4)
    { name: 'Gibson Les Paul Standard 2019', description: 'Electric guitar in Heritage Cherry Sunburst. Excellent condition. Original case included.', category: music._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop' },
    { name: 'Yamaha U1 Upright Piano',       description: 'Yamaha U1 upright piano. Serviced 2024. Good touch, even tone. Stool included. Pune delivery.', category: music._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop' },
    { name: 'Tabla Set — Benares Style',     description: 'Professional-grade Benares tabla set. Dayan + Bayan. Excellent resonance. Covers & strap included.', category: music._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop' },

    // Books (s4)
    { name: 'UPSC Complete Study Kit 2024',  description: '35-book UPSC preparation set. Laxmikant, NCERTs, Shankar IAS, Vision PT 365. Minimal highlights.', category: books._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop' },
    { name: 'Warren Buffett Letters Collection', description: 'Berkshire Hathaway annual letters 1965–2023 bound in 3 volumes. Exclusive collector\'s edition.', category: books._id, seller: s4._id, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop' },

    // Keychron keyboard
    { name: 'Keychron Q1 Pro QMK',     description: 'Wireless QMK mechanical keyboard. Gateron Jupiter Red switches. Aluminum frame. South-facing RGB.', category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&h=600&fit=crop' },
    { name: 'iPad Pro 12.9" M2 + Pencil', description: 'iPad Pro 12.9" M2 (256GB, WiFi + Cellular). Apple Pencil 2 + Magic Keyboard included. 4 months old.', category: electronics._id, seller: s1._id, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop' },
  ]);
  console.log(`Created ${items.length} items`);

  const [
    itIphone, itHeadphones, itMacbook, itTV, itDrone, itCamera,
    itSaree, itJacket, itLV, itPashmina,
    itGanesh, itPainting, itMughal, itBook,
    itWardrobe, itCarpet,
    itGold, itOmega,
    itBadminton, itBike, itFitbit,
    itREParts, itVespa,
    itGibson, itPiano, itTabla,
    itUPSC, itBuffett,
    itKeychron, itIPad,
  ] = items;

  // ── Auctions (30): 12 live, 8 scheduled, 10 ended ─────
  const auctions = await Auction.insertMany([
    // ── LIVE (12) ──────────────────────────────────────
    { item: itIphone._id,     seller: s1._id, basePrice: 80000,  currentPrice: 92500,  startTime: h(-8),  endTime: h(16),  minIncrement: 1000, status: 'live' },
    { item: itHeadphones._id, seller: s1._id, basePrice: 15000,  currentPrice: 18400,  startTime: h(-5),  endTime: h(19),  minIncrement: 200,  status: 'live' },
    { item: itMacbook._id,    seller: s1._id, basePrice: 110000, currentPrice: 124000, startTime: h(-3),  endTime: h(45),  minIncrement: 2000, status: 'live' },
    { item: itTV._id,         seller: s1._id, basePrice: 55000,  currentPrice: 61000,  startTime: h(-6),  endTime: h(18),  minIncrement: 500,  status: 'live' },
    { item: itDrone._id,      seller: s1._id, basePrice: 60000,  currentPrice: 68500,  startTime: h(-4),  endTime: h(20),  minIncrement: 500,  status: 'live' },
    { item: itSaree._id,      seller: s3._id, basePrice: 8000,   currentPrice: 10200,  startTime: h(-7),  endTime: h(17),  minIncrement: 200,  status: 'live' },
    { item: itGanesh._id,     seller: s2._id, basePrice: 35000,  currentPrice: 42000,  startTime: h(-2),  endTime: h(46),  minIncrement: 500,  status: 'live' },
    { item: itGold._id,       seller: s2._id, basePrice: 180000, currentPrice: 196000, startTime: h(-1),  endTime: h(47),  minIncrement: 2000, status: 'live' },
    { item: itBike._id,       seller: s5._id, basePrice: 22000,  currentPrice: 27500,  startTime: h(-3),  endTime: h(21),  minIncrement: 500,  status: 'live' },
    { item: itGibson._id,     seller: s4._id, basePrice: 150000, currentPrice: 168000, startTime: h(-5),  endTime: h(43),  minIncrement: 2000, status: 'live' },
    { item: itIPad._id,       seller: s1._id, basePrice: 85000,  currentPrice: 93000,  startTime: h(-2),  endTime: h(22),  minIncrement: 1000, status: 'live' },
    { item: itCarpet._id,     seller: s2._id, basePrice: 45000,  currentPrice: 52000,  startTime: h(-4),  endTime: h(20),  minIncrement: 1000, status: 'live' },

    // ── SCHEDULED (8) ──────────────────────────────────
    { item: itCamera._id,    seller: s1._id, basePrice: 180000, currentPrice: 180000, startTime: h(24),  endTime: h(96),  minIncrement: 2000, status: 'scheduled' },
    { item: itLV._id,        seller: s3._id, basePrice: 75000,  currentPrice: 75000,  startTime: h(48),  endTime: h(120), minIncrement: 1000, status: 'scheduled' },
    { item: itOmega._id,     seller: s2._id, basePrice: 90000,  currentPrice: 90000,  startTime: h(36),  endTime: h(108), minIncrement: 2000, status: 'scheduled' },
    { item: itPiano._id,     seller: s4._id, basePrice: 95000,  currentPrice: 95000,  startTime: h(72),  endTime: h(144), minIncrement: 1000, status: 'scheduled' },
    { item: itVespa._id,     seller: s5._id, basePrice: 40000,  currentPrice: 40000,  startTime: h(24),  endTime: h(72),  minIncrement: 1000, status: 'scheduled' },
    { item: itWardrobe._id,  seller: s2._id, basePrice: 28000,  currentPrice: 28000,  startTime: h(60),  endTime: h(132), minIncrement: 500,  status: 'scheduled' },
    { item: itPashmina._id,  seller: s3._id, basePrice: 12000,  currentPrice: 12000,  startTime: h(12),  endTime: h(60),  minIncrement: 200,  status: 'scheduled' },
    { item: itREParts._id,   seller: s5._id, basePrice: 18000,  currentPrice: 18000,  startTime: h(48),  endTime: h(96),  minIncrement: 500,  status: 'scheduled' },

    // ── ENDED (10) ─────────────────────────────────────
    { item: itPainting._id,  seller: s2._id, basePrice: 18000,  currentPrice: 28500,  startTime: h(-96),  endTime: h(-24),  minIncrement: 500,  status: 'ended', winner: b3._id },
    { item: itJacket._id,    seller: s3._id, basePrice: 12000,  currentPrice: 17800,  startTime: h(-120), endTime: h(-48),  minIncrement: 300,  status: 'ended', winner: b7._id },
    { item: itKeychron._id,  seller: s1._id, basePrice: 12000,  currentPrice: 15600,  startTime: h(-144), endTime: h(-72),  minIncrement: 200,  status: 'ended', winner: b1._id },
    { item: itMughal._id,    seller: s2._id, basePrice: 55000,  currentPrice: 78000,  startTime: h(-168), endTime: h(-96),  minIncrement: 1000, status: 'ended', winner: b9._id },
    { item: itTabla._id,     seller: s4._id, basePrice: 8000,   currentPrice: 11500,  startTime: h(-72),  endTime: h(-24),  minIncrement: 200,  status: 'ended', winner: b5._id },
    { item: itBadminton._id, seller: s5._id, basePrice: 5000,   currentPrice: 7200,   startTime: h(-96),  endTime: h(-48),  minIncrement: 100,  status: 'ended', winner: b12._id },
    { item: itFitbit._id,    seller: s5._id, basePrice: 10000,  currentPrice: 13400,  startTime: h(-120), endTime: h(-72),  minIncrement: 200,  status: 'ended', winner: b4._id },
    { item: itUPSC._id,      seller: s4._id, basePrice: 4500,   currentPrice: 6800,   startTime: h(-144), endTime: h(-96),  minIncrement: 100,  status: 'ended', winner: b2._id },
    { item: itBook._id,      seller: s4._id, basePrice: 3500,   currentPrice: 5200,   startTime: h(-72),  endTime: h(-36),  minIncrement: 100,  status: 'ended', winner: b8._id },
    { item: itGold._id,      seller: s2._id, basePrice: 165000, currentPrice: 187000, startTime: h(-168), endTime: h(-120), minIncrement: 2000, status: 'ended', winner: b14._id },
  ]);
  console.log(`Created ${auctions.length} auctions`);

  const [
    aIphone, aHeadphones, aMacbook, aTV, aDrone, aSaree2, aGanesh, aGoldLive, aBike, aGibson, aIPad, aCarpet,
    aCameraS, aLVS, aOmegaS, aPianoS, aVespaS, aWardrobeS, aPashminaS, aREPartsS,
    aPaintingE, aJacketE, aKeychronE, aMughalE, aTablaE, aBadmintonE, aFitbitE, aUPSCE, aBookE, aGoldE,
  ] = auctions;

  const allBidders = [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15];

  // Helper: generate ascending bids for an auction
  function makeBids(auction, bidderPool, startAmount, increment, count, startHoursAgo) {
    const bids = [];
    let amount = startAmount;
    const interval = startHoursAgo / count;
    for (let i = 0; i < count; i++) {
      const bidder = bidderPool[i % bidderPool.length];
      bids.push({
        auction: auction._id,
        bidder: bidder._id,
        amount,
        isAutoBid: i % 3 === 2,
        createdAt: h(-(startHoursAgo - i * interval)),
      });
      amount += increment + Math.floor(Math.random() * increment * 0.5);
    }
    return bids;
  }

  const bids = [
    // ── Live auction bids ────────────────────────────────
    ...makeBids(aIphone,     [b1,b2,b4,b6,b9],      81000,  1500, 10, 7.5),
    ...makeBids(aHeadphones, [b3,b5,b7,b10],         15500,  500,  8,  4.5),
    ...makeBids(aMacbook,    [b2,b4,b8,b11,b13],     112000, 2500, 8,  2.5),
    ...makeBids(aTV,         [b1,b6,b12,b15],        55500,  1000, 7,  5.5),
    ...makeBids(aDrone,      [b3,b7,b9,b14],         60500,  1500, 8,  3.5),
    ...makeBids(aSaree2,     [b5,b8,b11,b13],        8200,   300,  8,  6.5),
    ...makeBids(aGanesh,     [b2,b6,b10,b15],        35500,  1000, 7,  1.5),
    ...makeBids(aGoldLive,   [b4,b9,b12,b14],        182000, 3000, 7,  0.8),
    ...makeBids(aBike,       [b1,b3,b5,b7,b10],      22500,  800,  10, 2.5),
    ...makeBids(aGibson,     [b2,b6,b11,b13,b15],    152000, 2500, 9,  4.5),
    ...makeBids(aIPad,       [b4,b8,b12,b14],        86000,  1500, 8,  1.8),
    ...makeBids(aCarpet,     [b1,b5,b9,b13],         46000,  1500, 7,  3.5),

    // ── Ended auction bids ───────────────────────────────
    ...makeBids(aPaintingE,  [b1,b3,b7,b9,b11],      18500,  1000, 10, 70),
    ...makeBids(aJacketE,    [b2,b7,b10,b13],         12300,  700,  10, 70),
    ...makeBids(aKeychronE,  [b1,b4,b8,b15],          12200,  500,  8,  70),
    ...makeBids(aMughalE,    [b5,b9,b12,b14],         56000,  2500, 11, 70),
    ...makeBids(aTablaE,     [b3,b5,b6,b11],          8200,   350,  8,  48),
    ...makeBids(aBadmintonE, [b6,b12,b14],            5100,   200,  10, 48),
    ...makeBids(aFitbitE,    [b2,b4,b8,b10,b15],      10200,  500,  8,  70),
    ...makeBids(aUPSCE,      [b2,b7,b13],             4600,   200,  10, 70),
    ...makeBids(aBookE,      [b1,b8,b11],             3600,   200,  8,  48),
    ...makeBids(aGoldE,      [b9,b12,b14,b15],        167000, 3000, 9,  70),
  ];

  await Bid.insertMany(bids);
  console.log(`Created ${bids.length} bids`);

  console.log('\n✅ Seed complete!\n');
  console.log('══════════════════════════════════════════════');
  console.log('Demo Accounts (password: demo1234)');
  console.log('──────────────────────────────────────────────');
  console.log('Sellers:');
  console.log('  seller1@auction.com  — Raj Electronics');
  console.log('  seller2@auction.com  — Meera Collectibles');
  console.log('  seller3@auction.com  — Arjun Fashion House');
  console.log('  seller4@auction.com  — Sunita Books & Art');
  console.log('  seller5@auction.com  — Vikram Auto Parts');
  console.log('──────────────────────────────────────────────');
  console.log('Bidders (bidder1 through bidder15 @auction.com)');
  console.log('──────────────────────────────────────────────');
  console.log('Data summary:');
  console.log(`  10 categories`);
  console.log(`  30 items`);
  console.log(`  12 live auctions`);
  console.log(`   8 scheduled auctions`);
  console.log(`  10 ended auctions`);
  console.log(`  ${bids.length} bids`);
  console.log('══════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
