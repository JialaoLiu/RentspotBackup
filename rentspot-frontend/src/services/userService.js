import api from './apiService';

/**
 * Get user profile information
 * @returns {Promise} - User profile data
 */
export function getUserProfile() {
  return api.get('/users/profile')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching user profile:', error);
      throw error;
    });
}

/**
 * Update user profile information
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - Updated user profile
 */
export function updateUserProfile(profileData) {
  return api.put('/users/profile', profileData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating user profile:', error);
      throw error;
    });
}

/**
 * Upload user avatar
 * @param {File} avatarFile - Avatar image file
 * @returns {Promise} - Upload result with avatar URL
 */
export function uploadUserAvatar(avatarFile) {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  return api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Error uploading avatar:', error);
    throw error;
  });
}

/**
 * Change user password
 * @param {Object} passwordData - Contains currentPassword and newPassword
 * @returns {Promise} - Result of password change
 */
export function changeUserPassword(passwordData) {
  return api.post('/users/change-password', passwordData)
    .then(response => response.data)
    .catch(error => {
      console.error('Error changing password:', error);
      throw error;
    });
}

/**
 * Get user's favorite properties
 * @returns {Promise} - List of favorite properties
 */
export function getUserFavorites() {
  return api.get('/users/favorites')
    .then(response => response.data.favorites)
    .catch(error => {
      console.error('Error fetching favorites:', error);
      throw error;
    });
}

export default {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  changeUserPassword,
  getUserFavorites
};