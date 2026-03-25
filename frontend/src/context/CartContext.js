import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const normalizeCart = (items = []) =>
    items.map(item => ({
      ...item,
      colorCode:
        item.colorCode ||
        (item.product?.category === 'paints'
          ? item.product?.specifications?.color || '#ff7a18'
          : null)
    }));

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? normalizeCart(JSON.parse(savedCart)) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id);
      const nextColorCode = options.colorCode;

      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                colorCode: nextColorCode || item.colorCode
              }
            : item
        );
      }
      
      return [
        ...prevCart,
        {
          product,
          quantity,
          colorCode: nextColorCode || null
        }
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateItemColor = (productId, colorCode) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product._id === productId
          ? { ...item, colorCode }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.price - (item.product.price * (item.product.discount || 0) / 100);
      const gst = price * (item.product.gst || 18) / 100;
      return total + (price + gst) * item.quantity;
    }, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.price - (item.product.price * (item.product.discount || 0) / 100);
      return total + price * item.quantity;
    }, 0);
  };

  const getGstTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.price - (item.product.price * (item.product.discount || 0) / 100);
      const gst = price * (item.product.gst || 18) / 100;
      return total + gst * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemColor,
    clearCart,
    getCartTotal,
    getSubtotal,
    getGstTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
