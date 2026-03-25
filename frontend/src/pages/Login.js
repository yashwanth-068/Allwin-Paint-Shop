import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'owner') {
        navigate('/owner');
      } else if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate(from);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">AWP</div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon">
                <FiMail />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon">
                <FiLock />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Sign up</Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="auth-demo-title">Demo Accounts:</p>
            <div className="auth-demo-accounts">
              <button 
                type="button"
                className="auth-demo-btn"
                onClick={() => setFormData({ email: 'owner@allwin.com', password: 'password123' })}
              >
                Owner
              </button>
              <button 
                type="button"
                className="auth-demo-btn"
                onClick={() => setFormData({ email: 'manager@allwin.com', password: 'password123' })}
              >
                Manager
              </button>
              <button 
                type="button"
                className="auth-demo-btn"
                onClick={() => setFormData({ email: 'buyer@allwin.com', password: 'password123' })}
              >
                Buyer
              </button>
            </div>
          </div>
        </div>

        <div className="auth-banner">
          <div className="auth-banner-content">
            <h2>All Win Paint Shop</h2>
            <p>Your trusted partner for quality building materials in Karur, Tamil Nadu</p>
            <ul className="auth-banner-features">
              <li>Premium Paints & Colors</li>
              <li>Quality Cement from Top Brands</li>
              <li>TMT Steel Bars & Rods</li>
              <li>Construction Tools & Hardware</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
