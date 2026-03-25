const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStock,
  getCategories
} = require('../controllers/productController');
const { protect, isManagerOrOwner, isOwner } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Manager/Owner routes
router.post('/', protect, isManagerOrOwner, createProduct);
router.put('/:id', protect, isManagerOrOwner, updateProduct);
router.put('/:id/stock', protect, isManagerOrOwner, updateStock);
router.get('/inventory/lowstock', protect, isManagerOrOwner, getLowStock);

// Owner only routes
router.delete('/:id', protect, isOwner, deleteProduct);

module.exports = router;
