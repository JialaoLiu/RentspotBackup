const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

const userController = {
  /**
   * Get user profile information
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id; // From JWT middleware
      
      // Query to get user details
      const [users] = await db.query(
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
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user profile without sensitive information
      const userProfile = users[0];
      delete userProfile.password; // Ensure password is not sent
      
      res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error in getProfile controller:', error);
      res.status(500).json({ 
        message: 'Error fetching user profile', 
        error: error.message 
      });
    }
  },
  
  /**
   * Update user profile information
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id; // From JWT middleware
      
      // Get existing user to ensure it exists
      const [users] = await db.query(
        'SELECT * FROM User WHERE user_id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = users[0];
      
      // Prepare update data
      const updateData = {
        user_name: req.body.name || user.user_name,
        user_phone: req.body.phone || user.user_phone,
        user_avatar_url: req.body.avatarUrl || user.user_avatar_url,
        user_date_of_birth: req.body.dateOfBirth || user.user_date_of_birth
      };
      
      // Update the user
      await db.query(
        `UPDATE User SET
          user_name = ?,
          user_phone = ?,
          user_avatar_url = ?,
          user_date_of_birth = ?
        WHERE user_id = ?`,
        [
          updateData.user_name,
          updateData.user_phone,
          updateData.user_avatar_url,
          updateData.user_date_of_birth,
          userId
        ]
      );
      
      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: userId,
          name: updateData.user_name,
          phone: updateData.user_phone,
          email: user.user_email,
          role: user.user_role,
          avatarUrl: updateData.user_avatar_url,
          dateOfBirth: updateData.user_date_of_birth
        }
      });
    } catch (error) {
      console.error('Error in updateProfile controller:', error);
      res.status(500).json({ 
        message: 'Error updating user profile', 
        error: error.message 
      });
    }
  },
  
  /**
   * Upload user avatar to Cloudinary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No avatar image provided' });
      }
      
      const userId = req.user.id; // From JWT middleware
      
      // Cloudinary already uploaded the file via middleware
      // Get the Cloudinary URL from the file
      const avatarUrl = req.file.path;
      
      // Update user record with new avatar URL
      await db.query(
        'UPDATE User SET user_avatar_url = ? WHERE user_id = ?',
        [avatarUrl, userId]
      );
      
      res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl
      });
    } catch (error) {
      console.error('Error in uploadAvatar controller:', error);
      res.status(500).json({ 
        message: 'Error uploading avatar', 
        error: error.message 
      });
    }
  },
  
  /**
   * Change user password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id; // From JWT middleware
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      // Get user record
      const [users] = await db.query(
        'SELECT user_password FROM User WHERE user_id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = users[0];
      
      // Verify current password
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.user_password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await db.query(
        'UPDATE User SET user_password = ? WHERE user_id = ?',
        [hashedPassword, userId]
      );
      
      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error in changePassword controller:', error);
      res.status(500).json({ 
        message: 'Error changing password', 
        error: error.message 
      });
    }
  },

  /**
   * Get favorite properties for the current user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getFavoriteProperties: async (req, res) => {
    try {
      const userId = req.user.id; // From JWT middleware
      
      // Get favorites with property details
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
      
      res.status(200).json({
        favorites
      });
    } catch (error) {
      console.error('Error in getFavoriteProperties controller:', error);
      res.status(500).json({ 
        message: 'Error fetching favorite properties', 
        error: error.message 
      });
    }
  }
};

module.exports = userController;