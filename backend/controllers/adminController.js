const db = require('../config/db');
const { sendError, handleDbError } = require('../utils/errorHandler');

const adminController = {
  // Get all users with pagination
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [users] = await db.query(
        `SELECT user_id, user_name, user_email, user_role, user_registered_at, 
                COALESCE(user_avatar_url, '/images/profile.png') as avatar
         FROM User 
         ORDER BY user_registered_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const [totalCount] = await db.query('SELECT COUNT(*) as total FROM User');
      const total = totalCount[0].total;

      res.json({
        success: true,
        users,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit
        }
      });
    } catch (error) {
      handleDbError(res, error, 'Failed to fetch users');
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (![0, 1, 2].includes(parseInt(role))) {
        return sendError(res, 'Invalid role. Must be 0 (renter), 1 (landlord), or 2 (admin)', 400);
      }

      await db.query('UPDATE User SET user_role = ? WHERE user_id = ?', [role, id]);

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      handleDbError(res, error, 'Failed to update user role');
    }
  },

  // Get dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const [userStats] = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN user_role = 0 THEN 1 ELSE 0 END) as renters,
          SUM(CASE WHEN user_role = 1 THEN 1 ELSE 0 END) as landlords,
          SUM(CASE WHEN user_role = 2 THEN 1 ELSE 0 END) as admins
        FROM User
      `);

      const [propertyStats] = await db.query('SELECT COUNT(*) as total_properties FROM Property');
      const [bookingStats] = await db.query('SELECT COUNT(*) as total_bookings FROM Booking');

      res.json({
        success: true,
        stats: {
          users: userStats[0],
          properties: propertyStats[0].total_properties,
          bookings: bookingStats[0].total_bookings
        }
      });
    } catch (error) {
      handleDbError(res, error, 'Failed to fetch dashboard stats');
    }
  }
};

module.exports = adminController;