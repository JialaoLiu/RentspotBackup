const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// User routes evolved from basic profile management to include avatar uploads and admin functions
// Admin functions were later moved to separate adminRoutes.js for better organization

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

// router.post('/avatar', uploadAvatar, (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }
//   res.json({ message: 'Avatar uploaded', avatarUrl: req.file.path });
// });

// Change password
router.post('/change-password', userController.changePassword);

// Get favorite properties
router.get('/favorites', userController.getFavoriteProperties);

// Admin-only routes (kept for backward compatibility)
// Get all users - Admin only
router.get('/all', requireAdmin, userController.getAllUsers);

// Get user by ID - Admin only
router.get('/:userId', requireAdmin, userController.getUserById);

// Update user role - Admin only
router.put('/:userId/role', requireAdmin, userController.updateUserRole);

// Delete user - Admin only
router.delete('/:userId', requireAdmin, userController.deleteUser);

// TODO: move admin routes to /api/admin/ endpoints
// TODO: add user preferences endpoint


module.exports = router;