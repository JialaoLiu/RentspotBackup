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

// Upload avatar - uses Cloudinary middleware with error handling
router.post('/avatar', (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File too large. Maximum size is 5MB.'
        });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      // Other errors
      return res.status(500).json({
        status: 'error',
        message: 'Error uploading file: ' + err.message
      });
    }
    next();
  });
}, userController.uploadAvatar);

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