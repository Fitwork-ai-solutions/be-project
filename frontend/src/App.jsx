import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UpdateProfile from './pages/UpdateProfile';
import SellerDashboard from './pages/SellerDashboard';
import BidderDashboard from './pages/BidderDashboard';
import AuctionDetail from './pages/AuctionDetail';
import CreateItem from './pages/CreateItem';
import CreateAuction from './pages/CreateAuction';
import CreateCategory from './pages/CreateCategory';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/create-item" element={<ProtectedRoute role="seller"><CreateItem /></ProtectedRoute>} />
        <Route path="/seller/create-auction" element={<ProtectedRoute role="seller"><CreateAuction /></ProtectedRoute>} />
        <Route path="/seller/create-category" element={<ProtectedRoute role="seller"><CreateCategory /></ProtectedRoute>} />
        <Route path="/bidder" element={<ProtectedRoute role="bidder"><BidderDashboard /></ProtectedRoute>} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="hero">
      <h1>Bid & Win</h1>
      <p className="tagline">
        Join live auctions, place bids in real time, and discover unique items. Sell or bid — your marketplace for exciting deals.
      </p>
      <div className="hero-ctas">
        <Link to="/login" className="btn btn-primary">Sign in</Link>
        <Link to="/register" className="btn btn-ghost">Create account</Link>
      </div>
    </div>
  );
}

export default App;
