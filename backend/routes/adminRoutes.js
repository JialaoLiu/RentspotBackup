const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Admin routes evolved from basic user management to comprehensive dashboard
// Started with just user listing, then added role changes, stats came later

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// router.use((req, res, next) => {
//   if (req.user.role !== 2) {
//     return res.status(403).json({ message: 'Admin access required' });
//   }
//   next();
// });

// Get all users with pagination
router.get('/users', adminController.getAllUsers);

// router.get('/users', async (req, res) => {
//   const users = await db.query('SELECT * FROM User');
//   res.json(users);
// });

// Update user role
router.put('/users/:id/role', adminController.updateUserRole);

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router;