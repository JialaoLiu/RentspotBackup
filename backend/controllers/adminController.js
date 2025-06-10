const db = require('../config/db');
const { sendError, handleDbError } = require('../utils/errorHandler');

// Admin controller handles admin-only functionality
// Started simple with just user listing, then added role management for security
// Dashboard stats came later when we needed better admin visibility
// Pagination was essential because user list got too long to load

const adminController = {
  // Get all users with pagination
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      // TODO: add search functionality for finding specific users

      // const [users] = await db.query(
      //   `SELECT user_id, user_name, user_email, user_role, user_registered_at
      //    FROM User 
      //    ORDER BY user_registered_at DESC`
      // );
      // res.json({ success: true, users });

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

  // Update user role (critical security function)
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      // console.log('Admin changing user role:', id, 'to', role); // for audit trail

      // Validate role values strictly
      if (![0, 1, 2].includes(parseInt(role))) {
        return sendError(res, 'Invalid role. Must be 0 (renter), 1 (landlord), or 2 (admin)', 400);
      }

      // Security check: prevent admin from demoting themselves (learned this the hard way)
      if (parseInt(id) === req.user.user_id && parseInt(role) !== 2) {
        return sendError(res, 'Cannot change your own admin role', 403);
      }

      // app.post('/admin/users/:id/role', async (req, res) => {
      //   const { id } = req.params;
      //   const { role } = req.body;
      //   await db.query('UPDATE User SET user_role = ? WHERE user_id = ?', [role, id]);
      //   res.json({ success: true });
      // });

      await db.query('UPDATE User SET user_role = ? WHERE user_id = ?', [role, id]);

      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      handleDbError(res, error, 'Failed to update user role');
    }
  },

  // Get dashboard stats for admin overview
  getDashboardStats: async (req, res) => {
    try {
      // Complex aggregation query for role breakdown
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

      // const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM User');
      // const [totalRenters] = await db.query('SELECT COUNT(*) as count FROM User WHERE user_role = 0');
      // const [totalLandlords] = await db.query('SELECT COUNT(*) as count FROM User WHERE user_role = 1');
      // const [totalAdmins] = await db.query('SELECT COUNT(*) as count FROM User WHERE user_role = 2');
      // const [totalProperties] = await db.query('SELECT COUNT(*) as count FROM Property');
      // const [totalBookings] = await db.query('SELECT COUNT(*) as count FROM Booking');
      //
      // res.json({
      //   success: true,
      //   stats: {
      //     users: totalUsers[0].count,
      //     renters: totalRenters[0].count,
      //     landlords: totalLandlords[0].count,
      //     admins: totalAdmins[0].count,
      //     properties: totalProperties[0].count,
      //     bookings: totalBookings[0].count
      //   }
      // });

      res.json({
        success: true,
        stats: {
          users: userStats[0],
          properties: propertyStats[0].total_properties,
          bookings: bookingStats[0].total_bookings
        }
      });
      // TODO: add growth metrics (new users this month, etc)
      // TODO: add property status breakdown (available/rented/removed)
    } catch (error) {
      handleDbError(res, error, 'Failed to fetch dashboard stats');
    }
  }
};

module.exports = adminController;