const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, isManagerOrOwner } = require('../middleware/auth');

// Buyer routes
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Manager/Owner routes
router.get('/', protect, isManagerOrOwner, getOrders);
router.put('/:id/status', protect, isManagerOrOwner, updateOrderStatus);

module.exports = router;
