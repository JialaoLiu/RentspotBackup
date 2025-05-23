const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const avatarUploadMiddleware = require('../middleware/avatarUploadMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Upload avatar - uses Cloudinary middleware
router.post('/avatar', avatarUploadMiddleware, userController.uploadAvatar);

// Change password
router.post('/change-password', userController.changePassword);

// Get favorite properties
router.get('/favorites', userController.getFavoriteProperties);

module.exports = router;