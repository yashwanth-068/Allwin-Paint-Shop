/**
 * Update product image URLs to local public images.
 * Run: node update-product-images.js (from backend folder)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const IMAGE_DIR = '/images/products';

const CATEGORY_IMAGES = {
  paints: `${IMAGE_DIR}/berger-silk-glamour-price.webp`,
  cement: `${IMAGE_DIR}/cement.webp`,
  steel_bars: `${IMAGE_DIR}/steel.webp`,
  tools: `${IMAGE_DIR}/steel.webp`,
  hardware: `${IMAGE_DIR}/gi-binding-wire.webp`,
  accessories: `${IMAGE_DIR}/berger-silk-glamour-price.webp`
};

const PRODUCT_IMAGES = {
  // Paints
  'Asian Paints Royale Matt': `${IMAGE_DIR}/asian-apex-ultima.webp`,
  'Asian Paints Apex Ultima': `${IMAGE_DIR}/asian-apex-ultima.webp`,
  'Berger Silk Glamor': `${IMAGE_DIR}/berger-silk-glamour-price.webp`,
  'Nerolac Excel Mica Marble': `${IMAGE_DIR}/berger-silk-glamour-price.webp`,
  'Dulux Velvet Touch': `${IMAGE_DIR}/dulux-velvet-touch.webp`,
  'Nippon Weatherbond': `${IMAGE_DIR}/berger-silk-glamour-price.webp`,
  'Indigo Easy Clean': `${IMAGE_DIR}/berger-silk-glamour-price.webp`,
  'Shalimar Superlac': `${IMAGE_DIR}/shalimar-superlac.webp`,
  'Asian Paints Tractor Emulsion': `${IMAGE_DIR}/asian-apex-ultima.webp`,
  // Cement
  'UltraTech Cement PPC': `${IMAGE_DIR}/cement.webp`,
  'ACC Cement OPC 53 Grade': `${IMAGE_DIR}/acc-opc-53.webp`,
  'Birla White Cement': `${IMAGE_DIR}/birla-white-cement.webp`,
  'Ramco Supergrade': `${IMAGE_DIR}/ramco-supergrade.webp`,
  'Dalmia DSP Cement': `${IMAGE_DIR}/cement.webp`,
  'JSW Cement PSC': `${IMAGE_DIR}/cement.webp`,
  // Steel Bars
  'TATA Tiscon 500D TMT Bar 8mm': `${IMAGE_DIR}/steel.webp`,
  'TATA Tiscon 500D TMT Bar 12mm': `${IMAGE_DIR}/steel.webp`,
  'JSW NeoSteel 550D TMT Bar 16mm': `${IMAGE_DIR}/steel.webp`,
  'SAIL TMT 550D Bar 10mm': `${IMAGE_DIR}/steel.webp`,
  'Vizag TMT 500D Bar 20mm': `${IMAGE_DIR}/steel.webp`,
  'Kamdhenu TMT 500D Bar 12mm': `${IMAGE_DIR}/steel.webp`,
  // Tools
  'Stanley Claw Hammer 500g': `${IMAGE_DIR}/steel.webp`,
  'Bosch GSB 500 RE Drill': `${IMAGE_DIR}/steel.webp`,
  'Taparia Adjustable Wrench 12"': `${IMAGE_DIR}/steel.webp`,
  'Black+Decker Heat Gun 1800W': `${IMAGE_DIR}/steel.webp`,
  // Hardware
  'GI Binding Wire 20 Gauge': `${IMAGE_DIR}/gi-binding-wire.webp`,
  'Sand (River Sand)': `${IMAGE_DIR}/cement.webp`,
  'Aggregate (20mm Jelly)': `${IMAGE_DIR}/cement.webp`,
  'Construction Nails 2 inch (Box)': `${IMAGE_DIR}/steel.webp`,
  'CPVC Pipe 1 inch (10 ft)': `${IMAGE_DIR}/steel.webp`
};

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/allwin_paint_shop';
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    const products = await Product.find({});
    if (!products.length) {
      console.log('No products found. Nothing to update.');
      process.exit(0);
    }

    const missing = [];
    const ops = products.map((product) => {
      const mapped = PRODUCT_IMAGES[product.name];
      if (!mapped) {
        missing.push(product.name);
      }
      const image = mapped || CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.paints;
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { images: [image] } }
        }
      };
    });

    const result = await Product.bulkWrite(ops, { ordered: false });
    console.log(`Updated ${result.modifiedCount || 0} products with local image URLs.`);

    if (missing.length) {
      const preview = missing.slice(0, 10).join(', ');
      console.log(`Products without explicit mapping: ${missing.length}`);
      console.log(`First few: ${preview}`);
    }
  } catch (err) {
    console.error('Update error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
