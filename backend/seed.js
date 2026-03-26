/**
 * Seed script for All Win Paint Shop
 * Run: node seed.js (from backend folder)
 * Requires: MongoDB running and .env with MONGODB_URI
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/allwin_paint_shop';
const SEED_FORCE = process.env.SEED_FORCE === 'true';

const demoUsers = [
  {
    name: 'Shop Owner',
    email: 'owner@allwin.com',
    phone: '9876543210',
    password: 'password123',
    role: 'owner',
    address: { street: '123 Main Road', city: 'Karur', state: 'Tamil Nadu', pincode: '639001' },
    isActive: true
  },
  {
    name: 'Shop Manager',
    email: 'manager@allwin.com',
    phone: '9876543211',
    password: 'password123',
    role: 'manager',
    address: { street: '456 Market Street', city: 'Karur', state: 'Tamil Nadu', pincode: '639001' },
    isActive: true
  },
  {
    name: 'Demo Buyer',
    email: 'buyer@allwin.com',
    phone: '9876543212',
    password: 'password123',
    role: 'buyer',
    address: { street: '789 Customer Lane', city: 'Karur', state: 'Tamil Nadu', pincode: '639002' },
    isActive: true
  }
];

const IMAGE_URLS = {
  paint_generic: '/images/products/berger-silk-glamour-price.webp',
  paint_asian: '/images/products/asian-apex-ultima.webp',
  paint_dulux: '/images/products/dulux-velvet-touch.webp',
  paint_shalimar: '/images/products/shalimar-superlac.webp',
  cement_generic: '/images/products/cement.webp',
  cement_acc: '/images/products/acc-opc-53.webp',
  cement_birla: '/images/products/birla-white-cement.webp',
  cement_ramco: '/images/products/ramco-supergrade.webp',
  cement_ramco_53: '/images/products/ramco-53-grade.webp',
  steel: '/images/products/steel.webp',
  wire: '/images/products/gi-binding-wire.webp',
  tool_shovel: '/images/products/shovel.jpg',
  tool_tile_setter: '/images/products/Marshalltown-57-7-x-4-38-Tile-Setters.webp',
  brush_1_in: '/images/products/paint-brush-1 inch.webp',
  brush_1_5_in: '/images/products/paint brush 1.5 inch.jpg',
  brush_2_in: '/images/products/bruch 2 inch.webp',
  brush_2_5_in: '/images/products/brush 2.5 inch.jpg',
  roller_9_in: '/images/products/paint-roller-500x500.webp',
  roller_tray: '/images/products/tray for roller.webp'
};

const CATEGORY_IMAGES = {
  paints: IMAGE_URLS.paint_generic,
  cement: IMAGE_URLS.cement_generic,
  steel_bars: IMAGE_URLS.steel,
  tools: IMAGE_URLS.steel,
  hardware: IMAGE_URLS.wire,
  accessories: IMAGE_URLS.paint_generic
};

const PRODUCT_IMAGES = {
  // Paints
  'Asian Paints Royale Matt': IMAGE_URLS.paint_asian,
  'Asian Paints Apex Ultima': IMAGE_URLS.paint_asian,
  'Berger Silk Glamor': IMAGE_URLS.paint_generic,
  'Nerolac Excel Mica Marble': IMAGE_URLS.paint_generic,
  'Dulux Velvet Touch': IMAGE_URLS.paint_dulux,
  'Nippon Weatherbond': IMAGE_URLS.paint_generic,
  'Indigo Easy Clean': IMAGE_URLS.paint_generic,
  'Shalimar Superlac': IMAGE_URLS.paint_shalimar,
  'Asian Paints Tractor Emulsion': IMAGE_URLS.paint_asian,
  'Asian Paints Royale Aspira': IMAGE_URLS.paint_asian,
  'Asian Paints Apex Ultima Protek': IMAGE_URLS.paint_asian,
  'Berger WeatherCoat Long Life': IMAGE_URLS.paint_generic,
  'Nerolac Impressions HD': IMAGE_URLS.paint_generic,
  'Nippon Spotless Plus': IMAGE_URLS.paint_generic,
  'Dulux Weathershield Max': IMAGE_URLS.paint_dulux,
  'Indigo Floor Coat': IMAGE_URLS.paint_generic,
  // Cement
  'UltraTech Cement PPC': IMAGE_URLS.cement_generic,
  'ACC Cement OPC 53 Grade': IMAGE_URLS.cement_acc,
  'Birla White Cement': IMAGE_URLS.cement_birla,
  'Ramco Supergrade': IMAGE_URLS.cement_ramco,
  'Dalmia DSP Cement': IMAGE_URLS.cement_generic,
  'JSW Cement PSC': IMAGE_URLS.cement_generic,
  'Ramco OPC 53 Grade': IMAGE_URLS.cement_ramco_53,
  'Chettinad Cement OPC 53': IMAGE_URLS.cement_generic,
  'India Cements Sankar Super Power': IMAGE_URLS.cement_generic,
  'Coromandel King PPC': IMAGE_URLS.cement_generic,
  // Steel Bars
  'TATA Tiscon 500D TMT Bar 8mm': IMAGE_URLS.steel,
  'TATA Tiscon 500D TMT Bar 12mm': IMAGE_URLS.steel,
  'JSW NeoSteel 550D TMT Bar 16mm': IMAGE_URLS.steel,
  'JSW NeoSteel 550D TMT Bar 8mm': IMAGE_URLS.steel,
  'SAIL TMT 550D Bar 10mm': IMAGE_URLS.steel,
  'Vizag TMT 500D Bar 20mm': IMAGE_URLS.steel,
  'Kamdhenu TMT 500D Bar 12mm': IMAGE_URLS.steel,
  'ARS TMT 550D Bar 12mm': IMAGE_URLS.steel,
  'KSR TMT 500D Bar 16mm': IMAGE_URLS.steel,
  // Tools
  'Stanley Claw Hammer 500g': IMAGE_URLS.steel,
  'Bosch GSB 500 RE Drill': IMAGE_URLS.steel,
  'Taparia Adjustable Wrench 12"': IMAGE_URLS.steel,
  'Black+Decker Heat Gun 1800W': IMAGE_URLS.steel,
  'Bosch Angle Grinder 710W': IMAGE_URLS.steel,
  'Stanley Measuring Tape 5m': IMAGE_URLS.steel,
  'Paint Roller Set 9 inch': IMAGE_URLS.paint_generic,
  'Paint Roller 9 inch': IMAGE_URLS.roller_9_in,
  'Taparia Screwdriver Set 6 pcs': IMAGE_URLS.steel,
  'Spirit Level 24 inch': IMAGE_URLS.steel,
  'Marshalltown Tile Setter Trowel 4-3/8 inch': IMAGE_URLS.tool_tile_setter,
  'Steel Shovel': IMAGE_URLS.tool_shovel,
  // Hardware
  'GI Binding Wire 20 Gauge': IMAGE_URLS.wire,
  'Binding Wire 22 Gauge (20 kg)': IMAGE_URLS.wire,
  'Sand (River Sand)': IMAGE_URLS.cement_generic,
  'Aggregate (20mm Jelly)': IMAGE_URLS.cement_generic,
  'Construction Nails 2 inch (Box)': IMAGE_URLS.steel,
  'CPVC Pipe 1 inch (10 ft)': IMAGE_URLS.steel,
  'PVC Pipe 1/2 inch (10 ft)': IMAGE_URLS.steel,
  'Electrical Conduit Pipe 25mm (10 ft)': IMAGE_URLS.steel,
  'MS Angle 25x25 mm (6 m)': IMAGE_URLS.steel,
  // Accessories
  'Asian Paints SmartCare Wall Putty 20kg': IMAGE_URLS.paint_generic,
  'Birla Wall Putty 40kg': IMAGE_URLS.cement_birla,
  'Fevicol SH 1kg': IMAGE_URLS.paint_generic,
  'M-Seal Epoxy 100g': IMAGE_URLS.paint_generic,
  'Painter Masking Tape 2 inch': IMAGE_URLS.paint_generic,
  'Sandpaper 100 Grit (Pack of 5)': IMAGE_URLS.paint_generic,
  'Paint Brush 4 inch': IMAGE_URLS.paint_generic,
  'Paint Brush 1 inch': IMAGE_URLS.brush_1_in,
  'Paint Brush 1.5 inch': IMAGE_URLS.brush_1_5_in,
  'Paint Brush 2 inch': IMAGE_URLS.brush_2_in,
  'Paint Brush 2.5 inch': IMAGE_URLS.brush_2_5_in,
  'Paint Tray for Roller': IMAGE_URLS.roller_tray,
  'Tile Setter Trowel (4x4)': IMAGE_URLS.tool_tile_setter,
  'Putty Knife 6 inch': IMAGE_URLS.steel,
  'Dr. Fixit Roofseal 1L': IMAGE_URLS.paint_generic
};

const sampleProducts = (ownerId) => [
  // Paints
  { name: 'Asian Paints Royale Matt', description: 'Premium interior emulsion with smooth matt finish.', category: 'paints', subCategory: 'Interior', brand: 'Asian Paints', price: 450, unit: 'liter', stock: 150, minStock: 20, gst: 18, discount: 5, isActive: true, createdBy: ownerId },
  { name: 'Asian Paints Apex Ultima', description: 'Weatherproof exterior emulsion.', category: 'paints', subCategory: 'Exterior', brand: 'Asian Paints', price: 550, unit: 'liter', stock: 100, minStock: 15, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Berger Silk Glamor', description: 'Luxury interior paint with silky smooth finish.', category: 'paints', subCategory: 'Interior', brand: 'Berger', price: 520, unit: 'liter', stock: 80, minStock: 15, gst: 18, discount: 10, isActive: true, createdBy: ownerId },
  { name: 'Nerolac Excel Mica Marble', description: 'Premium exterior finish with mica marble effect.', category: 'paints', subCategory: 'Exterior', brand: 'Nerolac', price: 680, unit: 'liter', stock: 60, minStock: 10, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  // Cement
  { name: 'UltraTech Cement PPC', description: 'Portland Pozzolana Cement. Best for all construction needs.', category: 'cement', subCategory: 'PPC', brand: 'UltraTech', price: 390, unit: 'bag', stock: 500, minStock: 100, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'ACC Cement OPC 53 Grade', description: 'Ordinary Portland Cement 53 Grade.', category: 'cement', subCategory: 'OPC', brand: 'ACC', price: 420, unit: 'bag', stock: 400, minStock: 80, gst: 28, discount: 2, isActive: true, createdBy: ownerId },
  { name: 'Birla White Cement', description: 'Premium white cement for finishing work.', category: 'cement', subCategory: 'White', brand: 'Birla', price: 650, unit: 'bag', stock: 200, minStock: 50, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  // Steel Bars
  { name: 'TATA Tiscon 500D TMT Bar 8mm', description: 'High strength TMT reinforcement bar. Fe 500D grade.', category: 'steel_bars', subCategory: 'TMT', brand: 'TATA Steel', price: 65, unit: 'kg', stock: 5000, minStock: 500, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'TATA Tiscon 500D TMT Bar 12mm', description: 'High strength TMT bar. Fe 500D grade.', category: 'steel_bars', subCategory: 'TMT', brand: 'TATA Steel', price: 65, unit: 'kg', stock: 8000, minStock: 800, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'JSW NeoSteel 550D TMT Bar 16mm', description: 'Superior quality TMT bar with high ductility.', category: 'steel_bars', subCategory: 'TMT', brand: 'JSW', price: 68, unit: 'kg', stock: 6000, minStock: 600, gst: 18, discount: 3, isActive: true, createdBy: ownerId },
  // Tools
  { name: 'Stanley Claw Hammer 500g', description: 'Professional grade claw hammer.', category: 'tools', subCategory: 'Hand Tools', brand: 'Stanley', price: 450, unit: 'piece', stock: 50, minStock: 10, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Bosch GSB 500 RE Drill', description: 'Professional impact drill. 500W motor.', category: 'tools', subCategory: 'Power Tools', brand: 'Bosch', price: 3200, unit: 'piece', stock: 25, minStock: 5, gst: 18, discount: 5, isActive: true, createdBy: ownerId },
  // Hardware
  { name: 'GI Binding Wire 20 Gauge', description: 'Galvanized iron binding wire. 25 kg bundle.', category: 'hardware', subCategory: 'Wire', brand: 'Local', price: 1800, unit: 'bundle', stock: 100, minStock: 20, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Sand (River Sand)', description: 'Fine quality river sand for construction.', category: 'hardware', subCategory: 'Aggregates', brand: 'Local', price: 2500, unit: 'ton', stock: 50, minStock: 10, gst: 5, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Aggregate (20mm Jelly)', description: 'Crushed stone aggregate 20mm for concrete.', category: 'hardware', subCategory: 'Aggregates', brand: 'Local', price: 1800, unit: 'ton', stock: 80, minStock: 15, gst: 5, discount: 0, isActive: true, createdBy: ownerId },
  // Additional Paints
  { name: 'Dulux Velvet Touch', description: 'Premium washable interior emulsion for smooth walls.', category: 'paints', subCategory: 'Interior', brand: 'Dulux', price: 480, unit: 'liter', stock: 90, minStock: 15, gst: 18, discount: 5, isActive: true, createdBy: ownerId },
  { name: 'Nippon Weatherbond', description: 'Long-lasting exterior paint for harsh weather.', category: 'paints', subCategory: 'Exterior', brand: 'Nippon', price: 610, unit: 'liter', stock: 70, minStock: 12, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Indigo Easy Clean', description: 'Low VOC interior paint with easy-clean finish.', category: 'paints', subCategory: 'Interior', brand: 'Indigo', price: 430, unit: 'liter', stock: 85, minStock: 15, gst: 18, discount: 4, isActive: true, createdBy: ownerId },
  { name: 'Shalimar Superlac', description: 'Durable enamel paint for wood and metal surfaces.', category: 'paints', subCategory: 'Enamel', brand: 'Shalimar', price: 360, unit: 'liter', stock: 75, minStock: 12, gst: 18, discount: 3, isActive: true, createdBy: ownerId },
  { name: 'Asian Paints Tractor Emulsion', description: 'Economy interior emulsion for everyday walls.', category: 'paints', subCategory: 'Interior', brand: 'Asian Paints', price: 320, unit: 'liter', stock: 110, minStock: 18, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Asian Paints Royale Aspira', description: 'Luxury interior emulsion with rich smooth finish. Popular in Tamil Nadu homes.', category: 'paints', subCategory: 'Interior', brand: 'Asian Paints', price: 620, unit: 'liter', stock: 60, minStock: 12, gst: 18, discount: 4, isActive: true, createdBy: ownerId },
  { name: 'Asian Paints Apex Ultima Protek', description: 'High performance exterior emulsion with anti-algal protection.', category: 'paints', subCategory: 'Exterior', brand: 'Asian Paints', price: 590, unit: 'liter', stock: 75, minStock: 12, gst: 18, discount: 2, isActive: true, createdBy: ownerId },
  { name: 'Berger WeatherCoat Long Life', description: 'Weatherproof exterior paint with long lasting protection.', category: 'paints', subCategory: 'Exterior', brand: 'Berger', price: 540, unit: 'liter', stock: 65, minStock: 10, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Nerolac Impressions HD', description: 'Premium interior emulsion with stain resistance and sheen.', category: 'paints', subCategory: 'Interior', brand: 'Nerolac', price: 500, unit: 'liter', stock: 55, minStock: 10, gst: 18, discount: 3, isActive: true, createdBy: ownerId },
  { name: 'Nippon Spotless Plus', description: 'Anti-bacterial interior paint for healthy living spaces.', category: 'paints', subCategory: 'Interior', brand: 'Nippon', price: 470, unit: 'liter', stock: 70, minStock: 12, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Dulux Weathershield Max', description: 'Exterior emulsion with superior weather protection.', category: 'paints', subCategory: 'Exterior', brand: 'Dulux', price: 560, unit: 'liter', stock: 60, minStock: 10, gst: 18, discount: 2, isActive: true, createdBy: ownerId },
  { name: 'Indigo Floor Coat', description: 'Floor paint for workshops and garages with high durability.', category: 'paints', subCategory: 'Floor', brand: 'Indigo', price: 520, unit: 'liter', stock: 45, minStock: 8, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  // Additional Cement
  { name: 'Ramco Supergrade', description: 'High strength cement suitable for RCC works.', category: 'cement', subCategory: 'PPC', brand: 'Ramco', price: 400, unit: 'bag', stock: 300, minStock: 70, gst: 28, discount: 1, isActive: true, createdBy: ownerId },
  { name: 'Dalmia DSP Cement', description: 'Durable cement with superior performance.', category: 'cement', subCategory: 'PPC', brand: 'Dalmia', price: 410, unit: 'bag', stock: 280, minStock: 60, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'JSW Cement PSC', description: 'Portland Slag Cement for coastal applications.', category: 'cement', subCategory: 'PSC', brand: 'JSW', price: 395, unit: 'bag', stock: 260, minStock: 55, gst: 28, discount: 2, isActive: true, createdBy: ownerId },
  { name: 'Ramco OPC 53 Grade', description: 'High early strength OPC 53 cement for fast setting works.', category: 'cement', subCategory: 'OPC', brand: 'Ramco', price: 435, unit: 'bag', stock: 240, minStock: 60, gst: 28, discount: 1, isActive: true, createdBy: ownerId },
  { name: 'Chettinad Cement OPC 53', description: 'Trusted Tamil Nadu cement brand for strong RCC structures.', category: 'cement', subCategory: 'OPC', brand: 'Chettinad', price: 430, unit: 'bag', stock: 220, minStock: 55, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'India Cements Sankar Super Power', description: 'Popular in Tamil Nadu for consistent strength and finish.', category: 'cement', subCategory: 'OPC', brand: 'India Cements', price: 425, unit: 'bag', stock: 210, minStock: 50, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Coromandel King PPC', description: 'PPC cement with better workability and durability.', category: 'cement', subCategory: 'PPC', brand: 'Coromandel', price: 410, unit: 'bag', stock: 230, minStock: 55, gst: 28, discount: 0, isActive: true, createdBy: ownerId },
  // Additional Steel Bars
  { name: 'SAIL TMT 550D Bar 10mm', description: 'High strength TMT bar for reinforced concrete.', category: 'steel_bars', subCategory: 'TMT', brand: 'SAIL', price: 66, unit: 'kg', stock: 4500, minStock: 450, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Vizag TMT 500D Bar 20mm', description: 'Durable 20mm TMT bar for heavy structures.', category: 'steel_bars', subCategory: 'TMT', brand: 'Vizag Steel', price: 69, unit: 'kg', stock: 5200, minStock: 500, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Kamdhenu TMT 500D Bar 12mm', description: 'Reliable 12mm TMT bar with high ductility.', category: 'steel_bars', subCategory: 'TMT', brand: 'Kamdhenu', price: 67, unit: 'kg', stock: 4800, minStock: 450, gst: 18, discount: 1, isActive: true, createdBy: ownerId },
  { name: 'ARS TMT 550D Bar 12mm', description: 'Tamil Nadu brand TMT bar with high ductility and strength.', category: 'steel_bars', subCategory: 'TMT', brand: 'ARS', price: 67, unit: 'kg', stock: 4200, minStock: 420, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'KSR TMT 500D Bar 16mm', description: 'Reliable 16mm TMT bar for beams and columns.', category: 'steel_bars', subCategory: 'TMT', brand: 'KSR', price: 68, unit: 'kg', stock: 4000, minStock: 400, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'JSW NeoSteel 550D TMT Bar 8mm', description: '8mm TMT bar ideal for stirrups and light RCC works.', category: 'steel_bars', subCategory: 'TMT', brand: 'JSW', price: 66, unit: 'kg', stock: 3500, minStock: 350, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  // Additional Tools
  { name: 'Taparia Adjustable Wrench 12\"', description: 'Heavy duty adjustable wrench for site use.', category: 'tools', subCategory: 'Hand Tools', brand: 'Taparia', price: 550, unit: 'piece', stock: 40, minStock: 8, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Black+Decker Heat Gun 1800W', description: 'Versatile heat gun for shrink wrap and paint removal.', category: 'tools', subCategory: 'Power Tools', brand: 'Black+Decker', price: 2900, unit: 'piece', stock: 18, minStock: 4, gst: 18, discount: 4, isActive: true, createdBy: ownerId },
  { name: 'Bosch Angle Grinder 710W', description: 'Compact angle grinder for cutting and polishing.', category: 'tools', subCategory: 'Power Tools', brand: 'Bosch', price: 2600, unit: 'piece', stock: 20, minStock: 4, gst: 18, discount: 3, isActive: true, createdBy: ownerId },
  { name: 'Stanley Measuring Tape 5m', description: 'Durable measuring tape for site measurements.', category: 'tools', subCategory: 'Hand Tools', brand: 'Stanley', price: 250, unit: 'piece', stock: 80, minStock: 15, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Roller 9 inch', description: '9 inch roller for smooth wall finish and fast coverage.', category: 'tools', subCategory: 'Painting Tools', brand: 'Generic', price: 286, unit: 'piece', stock: 120, minStock: 20, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Taparia Screwdriver Set 6 pcs', description: 'Mixed head screwdriver set for electrical work.', category: 'tools', subCategory: 'Hand Tools', brand: 'Taparia', price: 420, unit: 'piece', stock: 60, minStock: 12, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Spirit Level 24 inch', description: 'Aluminium spirit level for precision alignment.', category: 'tools', subCategory: 'Hand Tools', brand: 'Generic', price: 380, unit: 'piece', stock: 45, minStock: 8, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Tile Setter Trowel (4x4)', description: 'Tile setter trowel for spreading adhesive and leveling tiles.', category: 'tools', subCategory: 'Tiling Tools', brand: 'Generic', price: 270, unit: 'piece', stock: 35, minStock: 6, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Steel Shovel', description: 'Heavy-duty steel shovel for construction and digging work.', category: 'tools', subCategory: 'Hand Tools', brand: 'Generic', price: 712, unit: 'piece', stock: 30, minStock: 6, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  // Additional Hardware
  { name: 'Construction Nails 2 inch (Box)', description: 'High quality nails for concrete and wood work.', category: 'hardware', subCategory: 'Fasteners', brand: 'Local', price: 350, unit: 'bundle', stock: 120, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'CPVC Pipe 1 inch (10 ft)', description: 'Heat resistant CPVC plumbing pipe for interiors.', category: 'hardware', subCategory: 'Plumbing', brand: 'Astral', price: 220, unit: 'piece', stock: 160, minStock: 30, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'PVC Pipe 1/2 inch (10 ft)', description: 'Durable PVC pipe for water lines and drainage.', category: 'hardware', subCategory: 'Plumbing', brand: 'Supreme', price: 90, unit: 'piece', stock: 300, minStock: 60, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Electrical Conduit Pipe 25mm (10 ft)', description: 'Heavy duty conduit pipe for wiring and safety.', category: 'hardware', subCategory: 'Electrical', brand: 'AKG', price: 120, unit: 'piece', stock: 220, minStock: 40, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'MS Angle 25x25 mm (6 m)', description: 'Mild steel angle for fabrication and support works.', category: 'hardware', subCategory: 'Steel Sections', brand: 'Local', price: 520, unit: 'piece', stock: 140, minStock: 30, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Binding Wire 22 Gauge (20 kg)', description: 'Binding wire bundle commonly used in Tamil Nadu sites.', category: 'hardware', subCategory: 'Wire', brand: 'Local', price: 1550, unit: 'bundle', stock: 90, minStock: 15, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  // Accessories
  { name: 'Asian Paints SmartCare Wall Putty 20kg', description: 'Wall putty for smooth finish before painting.', category: 'accessories', subCategory: 'Putty', brand: 'Asian Paints', price: 650, unit: 'bag', stock: 160, minStock: 30, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Birla Wall Putty 40kg', description: 'Cement based wall putty for interiors and exteriors.', category: 'accessories', subCategory: 'Putty', brand: 'Birla', price: 720, unit: 'bag', stock: 140, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Fevicol SH 1kg', description: 'Synthetic resin adhesive for plywood and furniture work.', category: 'accessories', subCategory: 'Adhesive', brand: 'Pidilite', price: 280, unit: 'kg', stock: 120, minStock: 20, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'M-Seal Epoxy 100g', description: 'Quick fix epoxy compound for leak sealing and repair.', category: 'accessories', subCategory: 'Adhesive', brand: 'Pidilite', price: 90, unit: 'piece', stock: 200, minStock: 30, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Painter Masking Tape 2 inch', description: 'Masking tape for clean paint edges and protection.', category: 'accessories', subCategory: 'Painting', brand: 'Generic', price: 65, unit: 'piece', stock: 180, minStock: 30, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Sandpaper 100 Grit (Pack of 5)', description: 'Sanding sheets for surface preparation.', category: 'accessories', subCategory: 'Painting', brand: 'Generic', price: 70, unit: 'piece', stock: 150, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Brush 4 inch', description: 'Wide brush for fast coverage on walls and ceilings.', category: 'accessories', subCategory: 'Painting', brand: 'Generic', price: 120, unit: 'piece', stock: 130, minStock: 20, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Brush 1 inch', description: 'Small brush for trims and detailed paint work.', category: 'accessories', subCategory: 'Painting', brand: 'Total', price: 40, unit: 'piece', stock: 150, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Brush 1.5 inch', description: 'Mid-size brush for corners and touch-ups.', category: 'accessories', subCategory: 'Painting', brand: 'Ingco', price: 49, unit: 'piece', stock: 140, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Brush 2 inch', description: 'General purpose brush for walls and woodwork.', category: 'accessories', subCategory: 'Painting', brand: 'Ingco', price: 89, unit: 'piece', stock: 140, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Brush 2.5 inch', description: 'Larger brush for quick coverage and smooth finish.', category: 'accessories', subCategory: 'Painting', brand: 'Ingco', price: 87, unit: 'piece', stock: 120, minStock: 20, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Paint Tray for Roller', description: 'Paint tray for 9 inch rollers with easy clean finish.', category: 'accessories', subCategory: 'Painting', brand: 'Generic', price: 81, unit: 'piece', stock: 140, minStock: 25, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Putty Knife 6 inch', description: 'Stainless steel putty knife for smooth plastering.', category: 'accessories', subCategory: 'Painting', brand: 'Generic', price: 110, unit: 'piece', stock: 100, minStock: 15, gst: 18, discount: 0, isActive: true, createdBy: ownerId },
  { name: 'Dr. Fixit Roofseal 1L', description: 'Waterproofing solution for terraces and roofs.', category: 'accessories', subCategory: 'Waterproofing', brand: 'Dr. Fixit', price: 310, unit: 'liter', stock: 90, minStock: 12, gst: 18, discount: 0, isActive: true, createdBy: ownerId }
].map((product) => ({
  ...product,
  images: [PRODUCT_IMAGES[product.name] || CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.paints]
}));

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing demo data (optional - comment out to keep existing data)
    const demoEmails = demoUsers.map(user => user.email);
    const existingUsers = await User.find({ email: { $in: demoEmails } });
    if (existingUsers.length && !SEED_FORCE) {
      console.log('Demo users already exist. Skipping seed. (Set SEED_FORCE=true to re-seed)');
      process.exit(0);
      return;
    }

    if (existingUsers.length && SEED_FORCE) {
      const existingIds = existingUsers.map(user => user._id);
      await Product.deleteMany({ createdBy: { $in: existingIds } });
      await User.deleteMany({ _id: { $in: existingIds } });
      console.log('Existing demo data cleared (SEED_FORCE=true)');
    }

    // Create users
    const users = await User.create(demoUsers);
    const owner = users.find(u => u.role === 'owner');
    console.log('Created', users.length, 'demo users');

    // Create products
    const products = sampleProducts(owner._id);
    await Product.create(products);
    console.log('Created', products.length, 'sample products');

    console.log('\n--- All Win Paint Shop - Seed complete ---');
    console.log('Demo accounts:');
    console.log('  Owner:   owner@allwin.com   / password123');
    console.log('  Manager: manager@allwin.com / password123');
    console.log('  Buyer:   buyer@allwin.com   / password123');
    console.log('------------------------------------------\n');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
