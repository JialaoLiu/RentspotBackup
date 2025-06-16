<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1>Admin Dashboard</h1>
      
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="property-card stats-card">
          <h3>Total Users</h3>
          <p class="stat-number">{{ stats.users?.total_users || 0 }}</p>
          <div class="stat-breakdown">
            <span>Renters: {{ stats.users?.renters || 0 }}</span>
            <span>Landlords: {{ stats.users?.landlords || 0 }}</span>
            <span>Admins: {{ stats.users?.admins || 0 }}</span>
          </div>
        </div>
        
        <div class="property-card stats-card">
          <h3>Properties</h3>
          <p class="stat-number">{{ stats.properties || 0 }}</p>
        </div>
        
        <div class="property-card stats-card">
          <h3>Bookings</h3>
          <p class="stat-number">{{ stats.bookings || 0 }}</p>
        </div>
      </div>

      <!-- User Management -->
      <div class="user-management">
        <div class="user-management-header">
          <h2>User Management</h2>
          <button @click="openAddUserModal" class="btn-add-user">
            <Icon name="person_add" size="md" /> Add New User
          </button>
        </div>
        
        <div class="property-card">
          <LoadingSpinner v-if="loading" />
          
          <div v-else class="user-table">
            <div class="table-header">
              <div class="header-cell"> </div>
              <div class="header-cell">Name</div>
              <div class="header-cell">Email</div>
              <div class="header-cell">Role</div>
              <div class="header-cell">Registered</div>
              <div class="header-cell">Actions</div>
            </div>
            
            <div v-for="user in users" :key="user.user_id" class="table-row">
              <div class="cell avatar-cell">
                <img :src="user.avatar" :alt="user.user_name" class="user-avatar">
              </div>
              <div class="cell">{{ user.user_name }}</div>
              <div class="cell email-cell">{{ user.user_email }}</div>
              <div class="cell">
                <select 
                  v-if="user.user_role !== 2"
                  :value="user.user_role" 
                  @change="updateRole(user.user_id, $event.target.value)"
                  class="role-select"
                  :disabled="updating === user.user_id"
                >
                  <option value="0">Renter</option>
                  <option value="1">Landlord</option>
                </select>
                <span v-else class="role-badge role-admin">Admin</span>
              </div>
              <div class="cell">{{ formatDate(user.user_registered_at) }}</div>
              <div class="cell">
                <div class="action-buttons">
                  <button 
                    v-if="user.user_role !== 2" 
                    @click="editUser(user)" 
                    class="edit-btn"
                    :disabled="updating === user.user_id"
                    title="Edit User"
                  >
                    <Icon name="edit" size="sm" /> Edit
                  </button>
                  <button 
                    v-if="user.user_role !== 2" 
                    @click="deleteUser(user.user_id)" 
                    class="delete-btn"
                    :disabled="updating === user.user_id"
                    title="Delete User"
                  >
                    <Icon name="delete" size="sm" /> Delete
                  </button>
                  <span v-if="updating === user.user_id" class="updating-text">Updating...</span>
                  <span v-else class="role-badge" :class="getRoleClass(user.user_role)">
                    {{ getRoleText(user.user_role) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="pagination.total > 1" class="pagination">
            <button 
              @click="loadPage(pagination.current - 1)"
              :disabled="pagination.current === 1"
              class="btn-secondary"
            >
              Previous
            </button>
            
            <span class="page-info">
              Page {{ pagination.current }} of {{ pagination.total }}
            </span>
            
            <button 
              @click="loadPage(pagination.current + 1)"
              :disabled="pagination.current === pagination.total"
              class="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Edit User Modal (reusing UserProfile.vue structure) -->
      <div v-if="editingUser" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeEditModal">&times;</button>
          <div>
            <h2>Edit User Details</h2>
            <form @submit.prevent="updateUserDetails">
              <div class="form-group">
                <label for="edit-name">Full Name</label>
                <input 
                  type="text" 
                  id="edit-name" 
                  v-model="editingUser.user_name" 
                  placeholder="Enter full name" 
                  required
                />
              </div>
              <div class="form-group">
                <label for="edit-phone">Phone</label>
                <input 
                  type="text" 
                  id="edit-phone" 
                  v-model="editingUser.user_phone" 
                  placeholder="Enter phone number"
                />
              </div>
              <div class="form-group">
                <label for="edit-email">Email</label>
                <input 
                  type="email" 
                  id="edit-email" 
                  v-model="editingUser.user_email" 
                  disabled 
                />
                <span class="input-hint">Email cannot be changed</span>
              </div>
              <button type="submit" :disabled="updating" class="btn btn-primary btn-full">
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Add User Modal (reusing Signin.vue structure) -->
      <div v-if="showAddUserModal" class="modal-overlay" @click.self="closeAddUserModal">
        <div class="modal-content add-user-modal">
          <button class="modal-close" @click="closeAddUserModal">&times;</button>
          <div>
            <h2>Add New User</h2>
            <form @submit.prevent="createNewUser">
              <div class="form-group">
                <label for="new-name"><b>Name</b></label>
                <input 
                  type="text" 
                  id="new-name" 
                  v-model="newUser.user_name" 
                  placeholder="Enter Name" 
                  required
                />
                <div v-if="newUserErrors.name" class="field-error">{{ newUserErrors.name }}</div>
              </div>
              
              <div class="form-group">
                <label for="new-email"><b>Email</b></label>
                <input 
                  type="email" 
                  id="new-email" 
                  v-model="newUser.user_email" 
                  placeholder="Enter Email" 
                  required
                />
                <div v-if="newUserErrors.email" class="field-error">{{ newUserErrors.email }}</div>
              </div>
              
              <div class="form-group">
                <label for="new-password"><b>Password</b></label>
                <input 
                  type="password" 
                  id="new-password" 
                  v-model="newUser.user_password" 
                  placeholder="Enter Password (min 8 chars)" 
                  required
                />
                <div class="password-hint">Admin requirement: minimum 8 characters</div>
                <div v-if="newUserErrors.password" class="field-error">{{ newUserErrors.password }}</div>
              </div>
              
              <div class="form-group">
                <label for="new-phone"><b>Phone</b></label>
                <input 
                  type="text" 
                  id="new-phone" 
                  v-model="newUser.user_phone" 
                  placeholder="Enter Phone Number"
                />
                <div v-if="newUserErrors.phone" class="field-error">{{ newUserErrors.phone }}</div>
              </div>
              
              <div class="form-group">
                <label for="new-role"><b>Role</b></label>
                <select v-model="newUser.user_role" required>
                  <option value="0">Renter</option>
                  <option value="1">Landlord</option>
                  <option value="2">Admin</option>
                </select>
              </div>
              
              <button type="submit" :disabled="creatingUser" class="btn btn-primary btn-full">
                {{ creatingUser ? 'Creating...' : 'Create User' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';
import Icon from '../components/Common/Icon.vue';
import { useNotification } from '../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();

const users = ref([]);
const stats = ref({});
const loading = ref(false);
const updating = ref(null);
const editingUser = ref(null);
const showAddUserModal = ref(false);
const creatingUser = ref(false);
const newUser = ref({
  user_name: '',
  user_email: '',
  user_password: '',
  user_phone: '',
  user_role: 0
});
const newUserErrors = ref({
  name: '',
  email: '',
  password: '',
  phone: ''
});
const pagination = ref({
  current: 1,
  total: 1,
  limit: 10
});

// Load dashboard data
async function loadDashboard() {
  loading.value = true;
  try {
    await Promise.all([
      loadUsers(),
      loadStats()
    ]);
  } catch (error) {
    showError('Failed to load dashboard data');
  } finally {
    loading.value = false;
  }
}

// Load users with pagination
async function loadUsers(page = 1) {
  try {
    const response = await adminService.getUsers(page, pagination.value.limit);
    users.value = response.data.users;
    pagination.value = response.data.pagination;
  } catch (error) {
    showError('Failed to load users');
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await adminService.getStats();
    stats.value = response.data.stats;
  } catch (error) {
    showError('Failed to load statistics');
  }
}

// Load specific page
async function loadPage(page) {
  if (page >= 1 && page <= pagination.value.total) {
    await loadUsers(page);
  }
}

// Update user role
async function updateRole(userId, newRole) {
  if (newRole === users.value.find(u => u.user_id === userId)?.user_role.toString()) {
    return;
  }
  
  updating.value = userId;
  try {
    await adminService.updateUserRole(userId, parseInt(newRole));
    
    // Update local data
    const user = users.value.find(u => u.user_id === userId);
    if (user) {
      user.user_role = parseInt(newRole);
    }
    
    // Reload stats to reflect changes
    await loadStats();
    
    showSuccess('User role updated successfully');
  } catch (error) {
    showError('Failed to update user role');
    // Revert the select value
    const select = document.querySelector(`select[data-user-id="${userId}"]`);
    if (select) {
      select.value = users.value.find(u => u.user_id === userId)?.user_role || 0;
    }
  } finally {
    updating.value = null;
  }
}

// Helper functions
function getRoleText(role) {
  const roles = { 0: 'Renter', 1: 'Landlord', 2: 'Admin' };
  return roles[role] || 'Unknown';
}

function getRoleClass(role) {
  const classes = { 0: 'role-renter', 1: 'role-landlord', 2: 'role-admin' };
  return classes[role] || '';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

// Delete user function
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  updating.value = userId;
  try {
    await adminService.deleteUser(userId);
    showSuccess('User deleted successfully');
    
    // Reload users and stats
    await Promise.all([
      loadUsers(pagination.value.current),
      loadStats()
    ]);
  } catch (error) {
    showError('Failed to delete user');
  } finally {
    updating.value = null;
  }
}

// Edit user function (reusing UserProfile.vue pattern)
function editUser(user) {
  // console.log('Editing user:', user); // debug info - similar to UserProfile.vue
  
  // Create a copy to avoid direct mutation
  editingUser.value = {
    user_id: user.user_id,
    user_name: user.user_name,
    user_email: user.user_email,
    user_phone: user.user_phone || ''
  };
}

// Close edit modal
function closeEditModal() {
  editingUser.value = null;
}

// Update user details
async function updateUserDetails() {
  if (!editingUser.value) return;
  
  updating.value = editingUser.value.user_id;
  try {
    await adminService.updateUser(editingUser.value.user_id, {
      user_name: editingUser.value.user_name,
      user_phone: editingUser.value.user_phone
    });
    
    // Update local data
    const userIndex = users.value.findIndex(u => u.user_id === editingUser.value.user_id);
    if (userIndex !== -1) {
      users.value[userIndex].user_name = editingUser.value.user_name;
      users.value[userIndex].user_phone = editingUser.value.user_phone;
    }
    
    showSuccess('User updated successfully');
    closeEditModal();
  } catch (error) {
    showError('Failed to update user');
  } finally {
    updating.value = null;
  }
}

// Add user modal functions
function openAddUserModal() {
  showAddUserModal.value = true;
  // Reset form
  newUser.value = {
    user_name: '',
    user_email: '',
    user_password: '',
    user_phone: '',
    user_role: 0
  };
  newUserErrors.value = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };
}

function closeAddUserModal() {
  showAddUserModal.value = false;
}

// Create new user (reusing Signin.vue validation logic)
async function createNewUser() {
  // Clear previous errors
  newUserErrors.value = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };

  // Validate form (simplified admin requirements)
  let hasErrors = false;
  
  if (!newUser.value.user_name.trim()) {
    newUserErrors.value.name = 'Name is required';
    hasErrors = true;
  }
  
  if (!newUser.value.user_email.trim()) {
    newUserErrors.value.email = 'Email is required';
    hasErrors = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.value.user_email)) {
    newUserErrors.value.email = 'Please enter a valid email address';
    hasErrors = true;
  }
  
  if (!newUser.value.user_password) {
    newUserErrors.value.password = 'Password is required';
    hasErrors = true;
  } else if (newUser.value.user_password.length < 8) {
    newUserErrors.value.password = 'Password must be at least 8 characters';
    hasErrors = true;
  }

  if (hasErrors) return;

  creatingUser.value = true;
  try {
    // Use existing auth registration endpoint
    const apiUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${apiUrl.replace('/api', '')}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        user_name: newUser.value.user_name,
        user_email: newUser.value.user_email,
        user_password: newUser.value.user_password,
        user_phone: newUser.value.user_phone,
        user_role: parseInt(newUser.value.user_role)
      })
    });

    if (response.ok) {
      showSuccess('User created successfully');
      closeAddUserModal();
      
      // Reload users and stats
      await Promise.all([
        loadUsers(pagination.value.current),
        loadStats()
      ]);
    } else {
      const errorData = await response.json();
      showError(errorData.message || 'Failed to create user');
    }
  } catch (error) {
    showError('Failed to create user');
  } finally {
    creatingUser.value = false;
  }
}

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--surface-primary);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stats-card {
  text-align: center;
  padding: 1.5rem;
}

.stats-card h3 {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--interactive-primary);
  margin-bottom: 1rem;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.user-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-management h2 {
  color: var(--text-primary);
  margin: 0;
}

/* Use existing CSS classes from style.css */

.user-table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.table-header {
  background-color: var(--surface-secondary);
  font-weight: bold;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border-primary);
}

.table-row {
  border-bottom: 1px solid var(--border-primary);
  transition: background-color var(--transition-fast);
}

.table-row:hover {
  background-color: var(--surface-secondary);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.email-cell {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.role-select {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background-color: var(--background);
  color: var(--text-primary);
  width: 100%;
}

.role-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.role-renter { background-color: #e3f2fd; color: #1976d2; }
.role-landlord { background-color: #fff3e0; color: #f57c00; }
.role-admin { background-color: #fce4ec; color: #c2185b; }

.updating-text {
  color: var(--text-secondary);
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

/* Action buttons (matching PropertyManagementCard.vue style) */
.btn-add-user {
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.btn-add-user:hover {
  background-color: #2563EB;
}

.edit-btn, .delete-btn {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  background-color: #3B82F6;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background-color: #2563EB;
}

.delete-btn {
  background-color: #EF4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #DC2626;
}

.edit-btn:disabled, .delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal styles (reusing UserProfile.vue pattern) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--surface-elevated);
  padding: 2rem;
  border-radius: var(--radius-md);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid var(--border-primary);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: bold;
}

/* Form inputs use global styles from style.css */

.input-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  display: block;
}

/* Add User Modal specific styles */
.add-user-modal {
  max-width: 600px;
}

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.password-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-style: italic;
}

/* Form elements use global styles from style.css */

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 50px 1fr 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .email-cell,
  .cell:nth-child(4),
  .cell:nth-child(5) {
    display: none;
  }
  
  .header-cell:nth-child(3),
  .header-cell:nth-child(4),
  .header-cell:nth-child(5) {
    display: none;
  }
}
</style>