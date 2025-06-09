const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireLandlord } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
// Get available slots for property
router.get('/slots/:propertyId', bookingController.getAvailableSlots);

// Protected routes (authentication required)
router.use(authenticateToken);

// Get user's bookings
router.get('/', bookingController.getUserBookings);

// Create new booking
router.post('/', bookingController.createBooking);

// Update booking status
router.put('/:id', bookingController.updateBookingStatus);

// Cancel booking
router.delete('/:id', bookingController.cancelBooking);

// Get property bookings (landlord only)
router.get('/property/:propertyId', bookingController.getPropertyBookings);

// Get booking statistics (landlord only)
router.get('/stats', requireLandlord, bookingController.getBookingStats);

module.exports = router;