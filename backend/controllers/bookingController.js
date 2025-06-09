const Booking = require('../models/booking');
const Property = require('../models/property');
const { handleDbError, handleValidationError, handleNotFound } = require('../utils/errorHandler');

const bookingController = {
  /**
   * Get user's bookings
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const bookings = await Booking.getByUserId(userId);
      
      res.status(200).json({
        success: true,
        bookings
      });
    } catch (error) {
      handleDbError(res, error, 'fetching user bookings');
    }
  },

  /**
   * Get property bookings (landlord only)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getPropertyBookings: async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user.id;
      
      if (isNaN(propertyId)) {
        return handleValidationError(res, 'Invalid property ID');
      }
      
      // Verify property ownership
      const property = await Property.getById(propertyId);
      if (!property) {
        return handleNotFound(res, 'Property');
      }
      
      if (property.owner_id !== userId && req.user.role !== 2) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view bookings for your own properties'
        });
      }
      
      const bookings = await Booking.getByPropertyId(propertyId);
      
      res.status(200).json({
        success: true,
        bookings
      });
    } catch (error) {
      handleDbError(res, error, 'fetching property bookings');
    }
  },

  /**
   * Create new booking
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createBooking: async (req, res) => {
    try {
      const userId = req.user.id;
      const { propertyId, datetime } = req.body;
      
      // Validate input
      if (!propertyId || !datetime) {
        return handleValidationError(res, 'Property ID and datetime are required');
      }
      
      const bookingDate = new Date(datetime);
      if (isNaN(bookingDate.getTime())) {
        return handleValidationError(res, 'Invalid datetime format');
      }
      
      // Check if booking is at least 4 hours in future
      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      
      if (bookingDate < fourHoursFromNow) {
        return handleValidationError(res, 'Booking must be at least 4 hours in advance');
      }
      
      // Verify property exists
      const property = await Property.getById(propertyId);
      if (!property) {
        return handleNotFound(res, 'Property');
      }
      
      // Check if user already has booking for this property
      const hasExistingBooking = await Booking.checkExistingBooking(userId, propertyId);
      if (hasExistingBooking) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active booking for this property'
        });
      }
      
      // Create booking
      const bookingData = {
        userId,
        propertyId,
        datetime: bookingDate
      };
      
      const createdBooking = await Booking.create(bookingData);
      
      res.status(201).json({
        success: true,
        message: 'Inspection booked successfully',
        booking: createdBooking
      });
    } catch (error) {
      handleDbError(res, error, 'creating booking');
    }
  },

  /**
   * Update booking status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateBookingStatus: async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.id;
      
      if (isNaN(bookingId)) {
        return handleValidationError(res, 'Invalid booking ID');
      }
      
      if (![0, 1, 2, 3].includes(status)) {
        return handleValidationError(res, 'Invalid status value');
      }
      
      // Get booking details
      const booking = await Booking.getById(bookingId);
      if (!booking) {
        return handleNotFound(res, 'Booking');
      }
      
      // Check permissions
      const isOwner = booking.booking_user_id === userId;
      const isLandlord = booking.owner_id === userId;
      const isAdmin = req.user.role === 2;
      
      if (!isOwner && !isLandlord && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this booking'
        });
      }
      
      // Update status
      const updated = await Booking.updateStatus(bookingId, status);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update booking status'
        });
      }
      
      const statusNames = {
        0: 'pending',
        1: 'confirmed',
        2: 'cancelled',
        3: 'completed'
      };
      
      res.status(200).json({
        success: true,
        message: `Booking ${statusNames[status]} successfully`
      });
    } catch (error) {
      handleDbError(res, error, 'updating booking status');
    }
  },

  /**
   * Cancel booking
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  cancelBooking: async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const userId = req.user.id;
      
      if (isNaN(bookingId)) {
        return handleValidationError(res, 'Invalid booking ID');
      }
      
      // Get booking details
      const booking = await Booking.getById(bookingId);
      if (!booking) {
        return handleNotFound(res, 'Booking');
      }
      
      // Check if user owns this booking
      if (booking.booking_user_id !== userId && req.user.role !== 2) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to cancel this booking'
        });
      }
      
      // Check if booking can be cancelled (at least 4 hours before)
      const bookingTime = new Date(booking.booking_datetime);
      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      
      if (bookingTime < fourHoursFromNow) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel booking less than 4 hours before inspection time'
        });
      }
      
      // Cancel booking
      const cancelled = await Booking.delete(bookingId);
      
      if (!cancelled) {
        return res.status(500).json({
          success: false,
          message: 'Failed to cancel booking'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      handleDbError(res, error, 'cancelling booking');
    }
  },

  /**
   * Get available inspection slots for property
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAvailableSlots: async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(propertyId)) {
        return handleValidationError(res, 'Invalid property ID');
      }
      
      // Verify property exists
      const property = await Property.getById(propertyId);
      if (!property) {
        return handleNotFound(res, 'Property');
      }
      
      const slots = await Booking.getAvailableSlots(propertyId);
      
      res.status(200).json({
        success: true,
        slots
      });
    } catch (error) {
      handleDbError(res, error, 'fetching available slots');
    }
  },

  /**
   * Get booking statistics for landlord
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBookingStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Only landlords and admins can access stats
      if (req.user.role < 1) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Landlord access required'
        });
      }
      
      const stats = await Booking.getLandlordStats(userId);
      
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      handleDbError(res, error, 'fetching booking statistics');
    }
  }
};

module.exports = bookingController;