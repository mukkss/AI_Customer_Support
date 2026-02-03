import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import './index.css';

import Register from './pages/Register';
import ChatWidget from './components/ChatWidget';

// Simple Auth Guard (Placeholder)
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

import { useLocation } from 'react-router-dom';

// Layout component to handle conditional rendering based on route/auth
const Layout = () => {
  const location = useLocation(); // Triggers re-render on route change
  const user = JSON.parse(localStorage.getItem('user'));
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="app-container">
      <Navbar />
      <main className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {/* Only show ChatWidget when logged in */}
      {user && <ChatWidget />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <CartProvider>
        <Layout />
      </CartProvider>
    </Router>
  );
}

export default App;
