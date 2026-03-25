import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const BuyerOrders = lazy(() => import('./pages/BuyerOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const BuyerProfile = lazy(() => import('./pages/BuyerProfile'));
const Contact = lazy(() => import('./pages/Contact'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Layout (with Navbar and Footer)
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

// App Routes
const AppRoutes = () => {
  const { isStaff } = useAuth();

  return (
    <Suspense fallback={
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    }>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Buyer Routes */}
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <PublicLayout><Checkout /></PublicLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <PublicLayout><BuyerOrders /></PublicLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <PublicLayout><OrderDetails /></PublicLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PublicLayout><BuyerProfile /></PublicLayout>
            </ProtectedRoute>
          } 
        />

        {/* Owner Dashboard */}
        <Route 
          path="/owner/*" 
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Manager Dashboard */}
        <Route 
          path="/manager/*" 
          element={
            <ProtectedRoute allowedRoles={['owner', 'manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={
          <PublicLayout>
            <div className="container" style={{padding: '4rem 1rem', textAlign: 'center', minHeight: '50vh'}}>
              <h1 style={{fontSize: '4rem', color: '#e5e7eb'}}>404</h1>
              <h2>Page Not Found</h2>
              <p style={{color: '#6b7280', marginTop: '1rem'}}>The page you're looking for doesn't exist.</p>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
