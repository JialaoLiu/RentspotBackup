const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Upload avatar - uses Cloudinary middleware
router.post('/avatar', uploadAvatar, userController.uploadAvatar);

// Change password
router.post('/change-password', userController.changePassword);

// Get favorite properties
router.get('/favorites', userController.getFavoriteProperties);

// Admin-only routes
// Get all users - Admin only
router.get('/all', requireAdmin, userController.getAllUsers);

// Get user by ID - Admin only
router.get('/:userId', requireAdmin, userController.getUserById);

// Update user role - Admin only
router.put('/:userId/role', requireAdmin, userController.updateUserRole);

// Delete user - Admin only
router.delete('/:userId', requireAdmin, userController.deleteUser);


module.exports = router;