const express = require('express');
const router = express.Router();
const {
  getOwnerDashboard,
  getManagerDashboard
} = require('../controllers/dashboardController');
const { protect, isManagerOrOwner, isOwner } = require('../middleware/auth');

// Owner dashboard
router.get('/owner', protect, isOwner, getOwnerDashboard);

// Manager dashboard
router.get('/manager', protect, isManagerOrOwner, getManagerDashboard);

module.exports = router;
