// Format currency in INR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

// Format date with time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Get status badge class
export const getStatusClass = (status) => {
  const statusClasses = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    partial: 'badge-warning',
    credit: 'badge-danger',
    failed: 'badge-danger',
    refunded: 'badge-info'
  };
  return statusClasses[status] || 'badge-primary';
};

// Category display names
export const getCategoryName = (category) => {
  const categories = {
    paints: 'Paints & Colors',
    cement: 'Cement',
    steel_bars: 'Steel Bars & Rods',
    tools: 'Tools',
    accessories: 'Accessories',
    hardware: 'Hardware'
  };
  return categories[category] || category;
};

// Unit display names
export const getUnitName = (unit) => {
  const units = {
    piece: 'Piece',
    kg: 'Kg',
    liter: 'Liter',
    bag: 'Bag',
    bundle: 'Bundle',
    ton: 'Ton',
    sq_ft: 'Sq.Ft'
  };
  return units[unit] || unit;
};

// Calculate price with discount and GST
export const calculateFinalPrice = (price, discount = 0, gst = 18) => {
  const discountedPrice = price - (price * discount / 100);
  return discountedPrice + (discountedPrice * gst / 100);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate Indian phone number
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// Validate email
export const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// Validate pincode
export const isValidPincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};
