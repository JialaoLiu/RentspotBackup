import apiService from './apiService';

const bookingService = {
  /**
   * Get user's bookings
   * @returns {Promise} API response
   */
  getUserBookings() {
    return apiService.get('/bookings');
  },

  /**
   * Get property bookings (landlord only)
   * @param {number} propertyId - Property ID
   * @returns {Promise} API response
   */
  getPropertyBookings(propertyId) {
    return apiService.get(`/bookings/property/${propertyId}`);
  },

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise} API response
   */
  createBooking(bookingData) {
    return apiService.post('/bookings', bookingData);
  },

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {number} status - New status
   * @returns {Promise} API response
   */
  updateBookingStatus(bookingId, status) {
    return apiService.put(`/bookings/${bookingId}`, { status });
  },

  /**
   * Cancel booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise} API response
   */
  cancelBooking(bookingId) {
    return apiService.delete(`/bookings/${bookingId}`);
  },

  /**
   * Get available slots for property
   * @param {number} propertyId - Property ID
   * @returns {Promise} API response
   */
  getAvailableSlots(propertyId) {
    return apiService.get(`/bookings/slots/${propertyId}`);
  },

  /**
   * Get booking statistics
   * @returns {Promise} API response
   */
  getBookingStats() {
    return apiService.get('/bookings/stats');
  }
};

export default bookingService;