require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/allwin_paint_shop';

const products = [
  {
    name: 'Paint Brush 1 inch',
    description: 'Small brush for trims and detailed paint work.',
    category: 'accessories',
    subCategory: 'Painting',
    brand: 'Generic',
    price: 40,
    unit: 'piece',
    stock: 150,
    minStock: 25,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/paint-brush-1 inch.webp']
  },
  {
    name: 'Paint Brush 1.5 inch',
    description: 'Mid-size brush for corners and touch-ups.',
    category: 'accessories',
    subCategory: 'Painting',
    brand: 'Generic',
    price: 49,
    unit: 'piece',
    stock: 140,
    minStock: 25,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/paint brush 1.5 inch.jpg']
  },
  {
    name: 'Paint Brush 2 inch',
    description: 'General purpose brush for walls and woodwork.',
    category: 'accessories',
    subCategory: 'Painting',
    brand: 'Generic',
    price: 89,
    unit: 'piece',
    stock: 140,
    minStock: 25,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/bruch 2 inch.webp']
  },
  {
    name: 'Paint Brush 2.5 inch',
    description: 'Larger brush for quick coverage and smooth finish.',
    category: 'accessories',
    subCategory: 'Painting',
    brand: 'Generic',
    price: 87,
    unit: 'piece',
    stock: 120,
    minStock: 20,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/brush 2.5 inch.jpg']
  },
  {
    name: 'Paint Roller 9 inch',
    description: '9 inch roller for smooth wall finish and fast coverage.',
    category: 'tools',
    subCategory: 'Painting Tools',
    brand: 'Generic',
    price: 286,
    unit: 'piece',
    stock: 120,
    minStock: 20,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/paint-roller-500x500.webp']
  },
  {
    name: 'Paint Tray for Roller',
    description: 'Paint tray for 9 inch rollers with easy clean finish.',
    category: 'accessories',
    subCategory: 'Painting',
    brand: 'Generic',
    price: 81,
    unit: 'piece',
    stock: 140,
    minStock: 25,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/tray for roller.webp']
  },
  {
    name: 'Tile Setter Trowel (4x4)',
    description: 'Tile setter trowel for spreading adhesive and leveling tiles.',
    category: 'tools',
    subCategory: 'Tiling Tools',
    brand: 'Generic',
    price: 270,
    unit: 'piece',
    stock: 35,
    minStock: 6,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/Marshalltown-57-7-x-4-38-Tile-Setters.webp']
  },
  {
    name: 'Steel Shovel',
    description: 'Heavy-duty steel shovel for construction and digging work.',
    category: 'tools',
    subCategory: 'Hand Tools',
    brand: 'Generic',
    price: 712,
    unit: 'piece',
    stock: 30,
    minStock: 6,
    gst: 18,
    discount: 0,
    isActive: true,
    images: ['/images/products/shovel.jpg']
  }
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    const owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      throw new Error('Owner user not found. Please create an owner account first.');
    }

    let upserted = 0;
    for (const product of products) {
      const result = await Product.updateOne(
        { name: product.name },
        { $set: { ...product, createdBy: owner._id } },
        { upsert: true }
      );
      if (result.upsertedCount) {
        upserted += 1;
      }
    }

    console.log(`Upserted ${products.length} products. Newly inserted: ${upserted}.`);
  } catch (error) {
    console.error('Add products error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
