import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStaff, isOwner } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (isOwner) return '/owner';
    if (isStaff) return '/manager';
    return '/profile';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <img src="/images/awp-logo.svg" alt="AWP logo" />
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-title">All Win Paint Shop</span>
              <span className="navbar-subtitle">Karur, Tamil Nadu</span>
            </div>
          </Link>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/products" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link to="/products?category=paints" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Paints
            </Link>
            <Link to="/products?category=cement" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Cement
            </Link>
            <Link to="/products?category=steel_bars" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Steel Bars
            </Link>
            <Link to="/contact" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>

          <div className="navbar-actions">
            <button
              className="navbar-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            {!isStaff && (
              <Link to="/cart" className="navbar-cart">
                <FiShoppingCart size={22} />
                {getCartCount() > 0 && (
                  <span className="navbar-cart-badge">{getCartCount()}</span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="navbar-user">
                <button 
                  className="navbar-user-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="navbar-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <strong>{user?.name}</strong>
                      <span className="badge badge-primary">{user?.role}</span>
                    </div>
                    <Link 
                      to={getDashboardLink()} 
                      className="navbar-dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FiSettings size={16} />
                      Dashboard
                    </Link>
                    {!isStaff && (
                      <Link 
                        to="/orders" 
                        className="navbar-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiShoppingCart size={16} />
                        My Orders
                      </Link>
                    )}
                    <button 
                      className="navbar-dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}

            <button 
              className="navbar-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
