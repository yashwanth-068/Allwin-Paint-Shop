import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiShield, FiHeadphones, FiPercent, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroImages = [
    '/images/products/a man painting.jpg',
    '/images/products/paint-roller-500x500.webp'
  ];
  const [heroImage] = useState(
    () => heroImages[Math.floor(Math.random() * heroImages.length)]
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=8');
      setFeaturedProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { 
      name: 'Paints & Colors', 
      slug: 'paints',
      image: '/images/products/asian paint royal matt.jpg',
      description: 'Premium quality paints for interior & exterior'
    },
    { 
      name: 'Cement', 
      slug: 'cement',
      image: '/images/products/cement.webp',
      description: 'Top brands - UltraTech, ACC, Birla'
    },
    { 
      name: 'Steel Bars & Rods', 
      slug: 'steel_bars',
      image: '/images/products/steel.webp',
      description: 'TMT bars and steel for construction'
    },
    { 
      name: 'Tools & Hardware', 
      slug: 'tools',
      image: '/images/products/taparia wrench.jpg',
      description: 'Professional tools and equipment'
    }
  ];

  const features = [
    { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹5000 in Karur' },
    { icon: FiShield, title: 'Quality Assured', desc: 'Genuine products from top brands' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Call us anytime for assistance' },
    { icon: FiPercent, title: 'Best Prices', desc: 'Competitive prices guaranteed' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Quality Building Materials
              <span className="hero-highlight">in Karur, Tamil Nadu</span>
            </h1>
            <p className="hero-subtitle">
              Your trusted partner for premium paints, cement, steel bars, and construction 
              materials. Serving Karur and surrounding areas with quality products at best prices.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-secondary btn-lg">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/contact" className="btn btn-outline btn-lg">
                Contact Us
              </Link>
            </div>
            <div className="hero-swatches">
              <span className="swatch swatch-1" aria-hidden="true"></span>
              <span className="swatch swatch-2" aria-hidden="true"></span>
              <span className="swatch swatch-3" aria-hidden="true"></span>
              <span className="swatch swatch-4" aria-hidden="true"></span>
              <span className="swatch swatch-5" aria-hidden="true"></span>
              <span className="swatch-label">Curated paint palettes for every finish</span>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">1999</span>
                <span className="hero-stat-label">Established</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">10K+</span>
                <span className="hero-stat-label">Happy Customers</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">150+</span>
                <span className="hero-stat-label">Products</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src={heroImage}
              alt="Construction Materials"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <feature.icon className="feature-icon" size={32} />
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse our wide range of building materials</p>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/products?category=${category.slug}`} 
                className="category-card"
              >
                <img src={category.image} alt={category.name} className="category-image" />
                <div className="category-overlay">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-desc">{category.description}</p>
                  <span className="category-link">
                    Shop Now <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Top selling products at best prices</p>
          </div>
          {loading ? (
            <div className="loading-overlay" style={{ position: 'relative', minHeight: '300px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="section-footer">
            <Link to="/products" className="btn btn-primary btn-lg">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="brands">
        <div className="container">
          <h2 className="section-title text-center">Trusted Brands We Carry</h2>
          <div className="brands-list">
            <span className="brand-item">Asian Paints</span>
            <span className="brand-item">Berger</span>
            <span className="brand-item">Nerolac</span>
            <span className="brand-item">UltraTech</span>
            <span className="brand-item">ACC</span>
            <span className="brand-item">Birla</span>
            <span className="brand-item">TATA Steel</span>
            <span className="brand-item">JSW</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Need Bulk Orders?</h2>
            <p className="cta-desc">
              Get special discounts on bulk orders. Contact us for customized quotes 
              for your construction projects.
            </p>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Get Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
