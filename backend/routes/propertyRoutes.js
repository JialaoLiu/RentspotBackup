const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authenticateToken = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Public routes - these don't require authentication
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes - these require authentication
router.post('/', authenticateToken, propertyController.createProperty);
router.put('/:id', authenticateToken, propertyController.updateProperty);
router.delete('/:id', authenticateToken, propertyController.deleteProperty);
router.get('/user/me', authenticateToken, propertyController.getMyProperties);

// Upload routes - these also require authentication
router.post('/upload', authenticateToken, uploadMiddleware.single, propertyController.uploadImage);
router.post('/upload/multiple', authenticateToken, uploadMiddleware.multiple, propertyController.uploadMultipleImages);

module.exports = router;