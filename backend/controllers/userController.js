const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt');
const { handleDbError, handleValidationError, handleNotFound } = require('../utils/errorHandler');

// User controller with simplified functions
const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      if (!userId) {
        return handleValidationError(res, 'Invalid user ID');
      }
      
      // Get user from database
      const [rows] = await db.execute(
        `SELECT 
          user_id AS id,
          user_name AS name,
          user_email AS email,
          user_phone AS phone,
          user_role AS role,
          user_avatar_url AS avatarUrl,
          user_date_of_birth AS dateOfBirth,
          user_registered_at AS registeredAt
        FROM User
        WHERE user_id = ?`,
        [userId]
      );
      
      if (!rows || rows.length === 0) {
        return handleNotFound(res, 'User');
      }
      
      res.json(rows[0]);
    } catch (error) {
      handleDbError(res, error, 'getting profile');
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user exists
      const [users] = await db.query('SELECT * FROM User WHERE user_id = ?', [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = users[0];
      
      // Get update data
      const updateFields = {
        user_name: req.body.name || user.user_name,
        user_phone: req.body.phone || user.user_phone,
        user_avatar_url: req.body.avatarUrl || user.user_avatar_url,
        user_date_of_birth: req.body.dateOfBirth || user.user_date_of_birth
      };
      
      // Update user
      await db.query(
        `UPDATE User SET
          user_name = ?,
          user_phone = ?,
          user_avatar_url = ?,
          user_date_of_birth = ?
        WHERE user_id = ?`,
        [
          updateFields.user_name,
          updateFields.user_phone, 
          updateFields.user_avatar_url,
          updateFields.user_date_of_birth,
          userId
        ]
      );
      
      res.json({
        message: 'Profile updated!',
        user: {
          id: userId,
          name: updateFields.user_name,
          phone: updateFields.user_phone,
          email: user.user_email,
          role: user.user_role,
          avatarUrl: updateFields.user_avatar_url,
          dateOfBirth: updateFields.user_date_of_birth
        }
      });
    } catch (error) {
      console.error('Update error:', error.message);
      res.status(500).json({ message: 'Could not update profile' });
    }
  },
  
  // Upload user avatar
  uploadAvatar: async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
      }
      
      const userId = req.user.id;
      const avatarUrl = req.file.path;
      
      // Update avatar URL in database
      await db.query(
        'UPDATE User SET user_avatar_url = ? WHERE user_id = ?',
        [avatarUrl, userId]
      );
      
      res.json({
        message: 'Avatar uploaded!',
        avatarUrl: avatarUrl
      });
    } catch (error) {
      console.error('Avatar upload error:', error.message);
      res.status(500).json({ message: 'Could not upload avatar' });
    }
  },
  
  // Change password
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Check inputs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password required' });
      }
      
      // Get user's current password
      const [users] = await db.query(
        'SELECT user_password FROM User WHERE user_id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if current password is correct
      const passwordValid = await bcrypt.compare(currentPassword, users[0].user_password);
      
      if (!passwordValid) {
        return res.status(401).json({ message: 'Wrong current password' });
      }
      
      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query(
        'UPDATE User SET user_password = ? WHERE user_id = ?',
        [hashedPassword, userId]
      );
      
      res.json({ message: 'Password changed!' });
    } catch (error) {
      console.error('Password change error:', error.message);
      res.status(500).json({ message: 'Could not change password' });
    }
  },

  // Get user's favorite properties
  getFavoriteProperties: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get favorites
      const [favorites] = await db.query(
        `SELECT 
          f.favorite_id,
          f.favorite_saved_at,
          p.property_id AS id,
          p.property_name AS title,
          p.property_price AS price,
          p.property_room AS bedrooms,
          p.property_bathroom AS bathrooms,
          p.property_type AS type,
          p.property_img_url AS image
        FROM Favorite f
        JOIN Property p ON f.favorite_property_id = p.property_id
        WHERE f.favorite_user_id = ?
        ORDER BY f.favorite_saved_at DESC`,
        [userId]
      );
      
      res.json({ favorites });
    } catch (error) {
      console.error('Favorites error:', error.message);
      res.status(500).json({ message: 'Could not get favorites' });
    }
  }
};

module.exports = userController;