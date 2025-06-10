const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users with pagination
router.get('/users', adminController.getAllUsers);

// Update user role
router.put('/users/:id/role', adminController.updateUserRole);

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router;