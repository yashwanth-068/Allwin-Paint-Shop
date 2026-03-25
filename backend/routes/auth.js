const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  createUser,
  getUsers,
  updateUserStatus
} = require('../controllers/authController');
const { protect, isOwner } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide valid email'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide valid Indian phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Owner only routes
router.post('/createuser', protect, isOwner, createUser);
router.get('/users', protect, isOwner, getUsers);
router.put('/users/:id/status', protect, isOwner, updateUserStatus);

module.exports = router;
