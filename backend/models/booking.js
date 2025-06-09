const db = require('../config/db');

const Booking = {
  /**
   * Get all bookings for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of bookings
   */
  getByUserId: async (userId) => {
    const query = `
      SELECT 
        b.*,
        p.property_name as title,
        p.property_address as address,
        p.property_latitude as lat,
        p.property_longitude as lng,
        COALESCE(
          (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id AND is_primary = 1 LIMIT 1),
          (SELECT image_url FROM PropertyImage WHERE property_id = p.property_id ORDER BY order_index ASC LIMIT 1),
          p.property_img_url
        ) AS image,
        u.user_name as owner_name,
        u.user_email as owner_email,
        u.user_phone as owner_phone
      FROM Booking b
      JOIN Property p ON b.booking_property_id = p.property_id
      JOIN User u ON p.property_owner_id = u.user_id
      WHERE b.booking_user_id = ?
      ORDER BY b.booking_datetime DESC
    `;
    
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  /**
   * Get all bookings for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of bookings
   */
  getByPropertyId: async (propertyId) => {
    const query = `
      SELECT 
        b.*,
        u.user_name,
        u.user_email,
        u.user_phone
      FROM Booking b
      JOIN User u ON b.booking_user_id = u.user_id
      WHERE b.booking_property_id = ?
      ORDER BY b.booking_datetime ASC
    `;
    
    const [rows] = await db.query(query, [propertyId]);
    return rows;
  },

  /**
   * Get booking by ID
   * @param {number} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  getById: async (bookingId) => {
    const query = `
      SELECT 
        b.*,
        p.property_name as title,
        p.property_address as address,
        p.property_owner_id as owner_id
      FROM Booking b
      JOIN Property p ON b.booking_property_id = p.property_id
      WHERE b.booking_id = ?
    `;
    
    const [rows] = await db.query(query, [bookingId]);
    return rows[0];
  },

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Created booking
   */
  create: async (bookingData) => {
    const query = `
      INSERT INTO Booking (
        booking_user_id,
        booking_property_id,
        booking_datetime,
        booking_status,
        booking_created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(query, [
      bookingData.userId,
      bookingData.propertyId,
      bookingData.datetime,
      1 // Auto-confirm as per requirements
    ]);
    
    return {
      id: result.insertId,
      ...bookingData,
      status: 1
    };
  },

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {number} status - New status
   * @returns {Promise<boolean>} Success status
   */
  updateStatus: async (bookingId, status) => {
    const query = `
      UPDATE Booking 
      SET booking_status = ?
      WHERE booking_id = ?
    `;
    
    const [result] = await db.query(query, [status, bookingId]);
    return result.affectedRows > 0;
  },

  /**
   * Delete booking (cancel)
   * @param {number} bookingId - Booking ID
   * @returns {Promise<boolean>} Success status
   */
  delete: async (bookingId) => {
    // Instead of deleting, update status to cancelled (2)
    return await Booking.updateStatus(bookingId, 2);
  },

  /**
   * Check if user already booked for a property
   * @param {number} userId - User ID
   * @param {number} propertyId - Property ID
   * @returns {Promise<boolean>} True if already booked
   */
  checkExistingBooking: async (userId, propertyId) => {
    const query = `
      SELECT COUNT(*) as count
      FROM Booking
      WHERE booking_user_id = ?
      AND booking_property_id = ?
      AND booking_status IN (0, 1) -- Pending or Confirmed
    `;
    
    const [rows] = await db.query(query, [userId, propertyId]);
    return rows[0].count > 0;
  },

  /**
   * Get available inspection slots for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of available slots
   */
  getAvailableSlots: async (propertyId) => {
    // For MVP, return predefined slots for next 7 days
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Morning slot (10:00 AM)
      const morningSlot = new Date(date);
      morningSlot.setHours(10, 0, 0, 0);
      slots.push({
        datetime: morningSlot,
        type: 'morning',
        available: true
      });
      
      // Afternoon slot (2:00 PM)
      const afternoonSlot = new Date(date);
      afternoonSlot.setHours(14, 0, 0, 0);
      slots.push({
        datetime: afternoonSlot,
        type: 'afternoon',
        available: true
      });
    }
    
    return slots;
  },

  /**
   * Get booking statistics for a landlord
   * @param {number} landlordId - Landlord user ID
   * @returns {Promise<Object>} Booking statistics
   */
  getLandlordStats: async (landlordId) => {
    const query = `
      SELECT 
        COUNT(DISTINCT b.booking_id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.booking_status = 1 THEN b.booking_id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.booking_status = 3 THEN b.booking_id END) as completed_bookings,
        COUNT(DISTINCT b.booking_property_id) as properties_with_bookings
      FROM Booking b
      JOIN Property p ON b.booking_property_id = p.property_id
      WHERE p.property_owner_id = ?
    `;
    
    const [rows] = await db.query(query, [landlordId]);
    return rows[0];
  }
};

module.exports = Booking;