const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: ['paints', 'cement', 'steel_bars', 'tools', 'accessories', 'hardware']
  },
  subCategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide brand name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Please provide unit'],
    enum: ['piece', 'kg', 'liter', 'bag', 'bundle', 'ton', 'sq_ft']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStock: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock cannot be negative']
  },
  images: [{
    type: String
  }],
  specifications: {
    color: String,
    size: String,
    weight: String,
    finish: String,
    grade: String
  },
  gst: {
    type: Number,
    default: 18,
    min: [0, 'GST cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for price with GST
productSchema.virtual('priceWithGST').get(function() {
  return this.price + (this.price * this.gst / 100);
});

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function() {
  const discountedPrice = this.price - (this.price * this.discount / 100);
  return discountedPrice + (discountedPrice * this.gst / 100);
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
