const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireLandlord } = require('../middleware/authMiddleware');

// Booking routes started as simple contact forms, evolved to complex scheduling system from milestone 1 and 2
// Public slot checking allows users to see availability before login

// Public routes (no authentication required)
// Get available slots for property
router.get('/slots/:propertyId', bookingController.getAvailableSlots);

// router.get('/slots/:propertyId', (req, res) => {
//   const slots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
//   res.json({ slots });
// });

// Protected routes (authentication required)
router.use(authenticateToken);

// Get user's bookings
router.get('/', bookingController.getUserBookings);

// Create new booking
router.post('/', bookingController.createBooking);

// router.post('/', (req, res) => {
//   const { propertyId, datetime } = req.body;
//   res.json({ message: 'Booking request sent to landlord' });
// });

// Update booking status
router.put('/:id', bookingController.updateBookingStatus);

// Cancel booking
router.delete('/:id', bookingController.cancelBooking);

// Get property bookings (landlord only)
router.get('/property/:propertyId', bookingController.getPropertyBookings);

// Get booking statistics (landlord only)
router.get('/stats', requireLandlord, bookingController.getBookingStats);

// TODO: add booking reminder notifications
// TODO: add booking history export

module.exports = router;