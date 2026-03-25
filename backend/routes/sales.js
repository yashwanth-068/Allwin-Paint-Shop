const express = require('express');
const router = express.Router();
const {
  createSale,
  createSaleFromOrder,
  getSales,
  getSale,
  updatePayment,
  getSalesReport
} = require('../controllers/saleController');
const { protect, isManagerOrOwner, isOwner } = require('../middleware/auth');

// Manager/Owner routes
router.post('/', protect, isManagerOrOwner, createSale);
router.post('/from-order/:orderId', protect, isManagerOrOwner, createSaleFromOrder);
router.get('/', protect, isManagerOrOwner, getSales);
router.get('/:id', protect, isManagerOrOwner, getSale);
router.put('/:id/payment', protect, isManagerOrOwner, updatePayment);

// Owner only routes
router.get('/reports/summary', protect, isOwner, getSalesReport);

module.exports = router;
