import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatCurrency, getCategoryName, getUnitName } from '../utils/helpers';
import { toast } from 'react-toastify';

const HARD_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">' +
    '<rect width="100%" height="100%" fill="#f1f5f9"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
    'font-family="Arial, sans-serif" font-size="20" fill="#64748b">' +
    'Image unavailable' +
    '</text>' +
  '</svg>'
)}`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);
  const finalPrice = discountedPrice + (discountedPrice * (product.gst || 18) / 100);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock < 1) {
      toast.error('Product is out of stock');
      return;
    }
    const defaultPaintColor = product?.specifications?.color || '#ff7a18';
    addToCart(product, 1, {
      colorCode: product.category === 'paints' ? defaultPaintColor : null
    });
    toast.success('Added to cart!');
  };

  const getPlaceholderImage = () => {
    const images = {
      paints: '/images/products/berger-silk-glamour-price.webp',
      cement: '/images/products/cement.webp',
      steel_bars: '/images/products/steel.webp',
      tools: '/images/products/steel.webp',
      hardware: '/images/products/gi-binding-wire.webp',
      accessories: '/images/products/berger-silk-glamour-price.webp'
    };
    return images[product.category] || images.paints;
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    const stage = img.dataset.fallbackStage;

    if (!stage) {
      img.dataset.fallbackStage = 'category';
      img.src = getPlaceholderImage();
      return;
    }

    if (stage === 'category') {
      img.dataset.fallbackStage = 'hard';
      img.src = HARD_FALLBACK_IMAGE;
    }
  };

  return (
    <article className="product-card">
      <div className="product-card-image-wrapper">
        <Link to={`/products/${product._id}`} className="product-card-link">
          <img
            src={product.images?.[0] || getPlaceholderImage()}
            alt={product.name}
            className="product-card-image"
            onError={handleImageError}
          />
        </Link>
        {product.discount > 0 && (
          <span className="product-card-discount">-{product.discount}%</span>
        )}
        {product.stock < 1 && (
          <span className="product-card-outofstock">Out of Stock</span>
        )}
        <div className="product-card-actions">
          <Link to={`/products/${product._id}`} className="product-card-action" title="View Details">
            <FiEye size={18} />
          </Link>
          <button 
            className="product-card-action" 
            title="Add to Cart"
            onClick={handleAddToCart}
            disabled={product.stock < 1}
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{getCategoryName(product.category)}</span>
        <Link to={`/products/${product._id}`} className="product-card-title">
          {product.name}
        </Link>
        <p className="product-card-brand">{product.brand}</p>
        <div className="product-card-price-row">
          <span className="product-card-price">{formatCurrency(finalPrice)}</span>
          {product.discount > 0 && (
            <span className="product-card-original-price">
              {formatCurrency(product.price * (1 + product.gst / 100))}
            </span>
          )}
        </div>
        <span className="product-card-unit">Per {getUnitName(product.unit)}</span>
        {product.stock > 0 && product.stock <= product.minStock && (
          <span className="product-card-lowstock">Only {product.stock} left!</span>
        )}
      </div>

      <style>{`
        .product-card-image-wrapper {
          position: relative;
          overflow: hidden;
        }

        .product-card-link {
          display: block;
          text-decoration: none;
        }

        .product-card-image {
          transition: transform 0.35s ease;
        }

        .product-card:hover .product-card-image {
          transform: scale(1.04);
        }

        .product-card-discount {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: linear-gradient(135deg, var(--accent-2), var(--secondary));
          color: white;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 999px;
        }

        .product-card-outofstock {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: var(--radius);
        }

        .product-card-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(12, 16, 35, 0) 0%, rgba(12, 16, 35, 0.9) 100%);
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          transform: translateY(100%);
          transition: var(--transition);
        }

        .product-card:hover .product-card-actions {
          transform: translateY(0);
        }

        .product-card-action {
          width: 40px;
          height: 40px;
          background: var(--surface);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          text-decoration: none;
          color: inherit;
        }

        .product-card-action:hover {
          background: var(--primary);
          color: white;
        }

        .product-card-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .product-card-brand {
          font-size: 0.75rem;
          color: var(--gray-500);
          margin-bottom: 0.5rem;
        }

        .product-card-title {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
          color: var(--gray-900);
          text-decoration: none;
        }

        .product-card-title:hover {
          color: var(--primary);
        }

        .product-card-price-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .product-card-unit {
          font-size: 0.75rem;
          color: var(--gray-500);
        }

        .product-card-lowstock {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--warning);
          font-weight: 500;
        }
      `}</style>
    </article>
  );
};

export default ProductCard;
