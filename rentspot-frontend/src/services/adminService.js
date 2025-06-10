import apiService from './apiService';

const adminService = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10) => {
    return apiService.get(`/admin/users?page=${page}&limit=${limit}`);
  },

  // Update user role
  updateUserRole: async (userId, newRole) => {
    return apiService.put(`/admin/users/${userId}/role`, { role: newRole });
  },

  // Get dashboard statistics
  getStats: async () => {
    return apiService.get('/admin/stats');
  }
};

export default adminService;