import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingBag, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { formatCurrency, getCategoryName, getUnitName } from '../utils/helpers';
import './ProductDetails.css';

const CATEGORY_IMAGES = {
  paints: '/images/products/berger-silk-glamour-price.webp',
  cement: '/images/products/cement.webp',
  steel_bars: '/images/products/steel.webp',
  tools: '/images/products/steel.webp',
  hardware: '/images/products/gi-binding-wire.webp',
  accessories: '/images/products/berger-silk-glamour-price.webp'
};

const HARD_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700">' +
    '<rect width="100%" height="100%" fill="#f1f5f9"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
    'font-family="Arial, sans-serif" font-size="22" fill="#64748b">' +
    'Image unavailable' +
    '</text>' +
  '</svg>'
)}`;

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || CATEGORY_IMAGES.paints;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colorCode, setColorCode] = useState('#ff7a18');

  const isPaint = product?.category === 'paints';

  const productImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.length ? product.images : [getCategoryImage(product.category)];
    return images;
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        const payload = response.data.data;
        setProduct(payload);
        setSelectedImage(payload.images?.[0] || getCategoryImage(payload.category));
        setColorCode(payload.specifications?.color || '#ff7a18');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  const handleImageError = (event) => {
    const img = event.currentTarget;
    const stage = img.dataset.fallbackStage;

    if (!stage) {
      img.dataset.fallbackStage = 'category';
      img.src = getCategoryImage(product?.category);
      return;
    }

    if (stage === 'category') {
      img.dataset.fallbackStage = 'hard';
      img.src = HARD_FALLBACK_IMAGE;
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock < 1) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity, { colorCode: isPaint ? colorCode : null });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container product-detail-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container product-detail-empty">
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);
  const finalPrice = discountedPrice + (discountedPrice * (product.gst || 18) / 100);

  return (
    <div className="product-detail-page">
      {/* Injected styles for UI perfection. Ideally, move to ProductDetails.css */}
      <style>{`
        .product-main-image {
          position: relative;
          overflow: hidden; /* To keep rounded corners on children */
        }
        .product-logo-watermark {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
          pointer-events: none; /* So it doesn't interfere with the button */
        }
      `}</style>
      <section className="product-detail-hero">
        <div className="container">
          <Link to="/products" className="product-detail-back">
            <FiArrowLeft /> Back to Products
          </Link>
          <div className="product-detail-grid">
            <div className="product-gallery">
              <div className="product-main-image">
                <button
                  type="button"
                  className="product-main-image-button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View product image"
                >
                  <img
                    src={selectedImage}
                    alt={product.name}
                    onError={handleImageError}
                  />
                </button>
                <div className="product-logo-watermark">
                  <FiShield />
                  <span>All Win Assured</span>
                </div>
              </div>
              {productImages.length > 1 && (
                <div className="product-thumbs">
                  {productImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`product-thumb ${selectedImage === image ? 'active' : ''}`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} onError={handleImageError} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-info">
              <span className="product-detail-category">{getCategoryName(product.category)}</span>
              <h1 className="product-detail-title">{product.name}</h1>
              <p className="product-detail-brand">{product.brand}</p>

              <div className="product-detail-price">
                <span className="price-current">{formatCurrency(finalPrice)}</span>
                {product.discount > 0 && (
                  <span className="price-original">{formatCurrency(product.price * (1 + product.gst / 100))}</span>
                )}
                <span className="price-note">Per {getUnitName(product.unit)}</span>
              </div>

              <div className="product-detail-meta">
                <span className={`stock-pill ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
                <span className="stock-note">GST {product.gst || 18}% included</span>
              </div>

              <p className="product-detail-description">{product.description}</p>

              {isPaint && (
                <div className="product-color-lab">
                  <div className="color-lab-header">
                    <div>
                      <h4>Choose Paint Shade</h4>
                      <p>Send this code to our mixer and receive your exact tone.</p>
                    </div>
                    <span className="color-chip" style={{ background: colorCode }} />
                  </div>
                  <div className="color-lab-controls">
                    <input
                      type="color"
                      value={colorCode}
                      onChange={(event) => setColorCode(event.target.value)}
                    />
                    <input
                      type="text"
                      value={colorCode}
                      onChange={(event) => setColorCode(event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="product-detail-quantity">
                <span>Quantity</span>
                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <FiMinus />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(product.stock || 99, prev + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="product-detail-actions">
                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock < 1}>
                  Add to Cart
                </button>
                <button className="btn btn-secondary btn-lg" onClick={handleBuyNow} disabled={product.stock < 1}>
                  <FiShoppingBag /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLightboxOpen && (
        <div className="product-image-modal" onClick={() => setIsLightboxOpen(false)}>
          <div className="product-image-modal-content" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="product-image-modal-close"
              onClick={() => setIsLightboxOpen(false)}
            >
              ×
            </button>
            <img src={selectedImage} alt={product.name} onError={handleImageError} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
