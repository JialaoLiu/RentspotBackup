const express = require('express');
const router = express.Router();
const propertyController = require('./debugPropertyController');

// Define basic property routes for testing
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);
router.get('/user/me', propertyController.getMyProperties);

// Export the router
module.exports = router;