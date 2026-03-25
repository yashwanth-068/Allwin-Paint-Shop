import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo">AWP</div>
              <div>
                <h3 className="footer-title">All Win Paint Shop</h3>
                <p className="footer-subtitle">Karur, Tamil Nadu</p>
              </div>
            </div>
            <p className="footer-desc">
              Your trusted partner for quality building materials since 2010. 
              We provide the best paints, cement, steel bars, and hardware 
              at competitive prices in Karur and surrounding areas.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=paints">Paints</Link></li>
              <li><Link to="/products?category=cement">Cement</Link></li>
              <li><Link to="/products?category=steel_bars">Steel Bars</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=paints">Paints & Colors</Link></li>
              <li><Link to="/products?category=cement">Cement</Link></li>
              <li><Link to="/products?category=steel_bars">Steel Bars & Rods</Link></li>
              <li><Link to="/products?category=tools">Tools</Link></li>
              <li><Link to="/products?category=hardware">Hardware</Link></li>
              <li><Link to="/products?category=accessories">Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiMapPin className="footer-icon" />
                <span>123 Main Road, Near Bus Stand,<br />Karur - 639001, Tamil Nadu</span>
              </li>
              <li>
                <FiPhone className="footer-icon" />
                <span>+91 98765 43210<br />+91 04324 252525</span>
              </li>
              <li>
                <FiMail className="footer-icon" />
                <span>info@allwinpaintshop.com</span>
              </li>
              <li>
                <FiClock className="footer-icon" />
                <span>Mon - Sat: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} All Win Paint Shop. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/refund">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
