import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getUnitName } from '../utils/helpers';
import './Cart.css';

const CATEGORY_IMAGES = {
  paints: '/images/products/berger-silk-glamour-price.webp',
  cement: '/images/products/cement.webp',
  steel_bars: '/images/products/steel.webp',
  tools: '/images/products/steel.webp',
  hardware: '/images/products/gi-binding-wire.webp',
  accessories: '/images/products/berger-silk-glamour-price.webp'
};

const HARD_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">' +
    '<rect width="100%" height="100%" fill="#f1f5f9"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
    'font-family="Arial, sans-serif" font-size="20" fill="#64748b">' +
    'Image unavailable' +
    '</text>' +
  '</svg>'
)}`;

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || CATEGORY_IMAGES.paints;

const handleCartImageError = (e, category) => {
  const img = e.currentTarget;
  const stage = img.dataset.fallbackStage;

  if (!stage) {
    img.dataset.fallbackStage = 'category';
    img.src = getCategoryImage(category);
    return;
  }

  if (stage === 'category') {
    img.dataset.fallbackStage = 'hard';
    img.src = HARD_FALLBACK_IMAGE;
  }
};

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateItemColor,
    getSubtotal,
    getGstTotal,
    getCartTotal,
    clearCart
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const deliveryCharge = getSubtotal() >= 5000 ? 0 : 100;
  const totalAmount = getCartTotal() + deliveryCharge;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FiShoppingBag size={80} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cart.length} item(s) in your cart</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => {
              const discountedPrice = item.product.price - (item.product.price * (item.product.discount || 0) / 100);
              const itemGst = discountedPrice * (item.product.gst || 18) / 100;
              const finalPrice = discountedPrice + itemGst;
              const isPaint = item.product.category === 'paints';
              const currentColor = item.colorCode || item.product.specifications?.color || '#ff7a18';

              return (
                <div key={item.product._id} className="cart-item">
                  <div className="cart-item-image">
                    <img 
                      src={item.product.images?.[0] || getCategoryImage(item.product.category)} 
                      alt={item.product.name}
                      onError={(e) => handleCartImageError(e, item.product.category)}
                    />
                  </div>
                  <div className="cart-item-details">
                    <Link to={`/products/${item.product._id}`} className="cart-item-name">
                      {item.product.name}
                    </Link>
                    <p className="cart-item-brand">{item.product.brand}</p>
                    <p className="cart-item-unit">Price per {getUnitName(item.product.unit)}</p>
                    {item.product.discount > 0 && (
                      <span className="cart-item-discount">-{item.product.discount}% off</span>
                    )}
                    {isPaint && (
                      <div className="cart-color-picker">
                        <span className="cart-color-label">Paint shade</span>
                        <div className="cart-color-controls">
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(event) => updateItemColor(item.product._id, event.target.value)}
                          />
                          <input
                            type="text"
                            value={currentColor}
                            onChange={(event) => updateItemColor(item.product._id, event.target.value)}
                          />
                          <span className="cart-color-swatch" style={{ background: currentColor }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="cart-item-price">
                    <span className="price-current">{formatCurrency(finalPrice)}</span>
                    {item.product.discount > 0 && (
                      <span className="price-original">
                        {formatCurrency(item.product.price * (1 + (item.product.gst || 18) / 100))}
                      </span>
                    )}
                    <span className="price-gst">Incl. {item.product.gst || 18}% GST</span>
                  </div>
                  <div className="cart-item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <div className="cart-item-total">
                    <span>{formatCurrency(finalPrice * item.quantity)}</span>
                  </div>
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}

            <div className="cart-actions">
              <Link to="/products" className="btn btn-outline">
                <FiArrowLeft /> Continue Shopping
              </Link>
              <button className="btn btn-outline" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>GST Total</span>
              <span>{formatCurrency(getGstTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>
                {deliveryCharge === 0 ? (
                  <span className="text-success">FREE</span>
                ) : (
                  formatCurrency(deliveryCharge)
                )}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <p className="summary-note">
                Add {formatCurrency(5000 - getSubtotal())} more for free delivery
              </p>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="summary-row summary-total">
              <span>Total Amount</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            <button 
              className="btn btn-primary btn-lg w-full"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>

            <div className="summary-info">
              <p>✓ Secure payment with Razorpay</p>
              <p>✓ Free delivery on orders above ₹5000</p>
              <p>✓ Quality guaranteed products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
