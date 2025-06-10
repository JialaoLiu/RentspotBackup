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
        <h2>User Management</h2>
        
        <div class="property-card">
          <LoadingSpinner v-if="loading" />
          
          <div v-else class="user-table">
            <div class="table-header">
              <div class="header-cell">Avatar</div>
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
                <span v-if="updating === user.user_id" class="updating-text">Updating...</span>
                <span v-else class="role-badge" :class="getRoleClass(user.user_role)">
                  {{ getRoleText(user.user_role) }}
                </span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/Common/LoadingSpinner.vue';
import { useNotification } from '../composables/useNotification';

const { showNotification } = useNotification();

const users = ref([]);
const stats = ref({});
const loading = ref(false);
const updating = ref(null);
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
    showNotification('Failed to load dashboard data', 'error');
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
    showNotification('Failed to load users', 'error');
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await adminService.getStats();
    stats.value = response.data.stats;
  } catch (error) {
    showNotification('Failed to load statistics', 'error');
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
    
    showNotification('User role updated successfully', 'success');
  } catch (error) {
    showNotification('Failed to update user role', 'error');
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

onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--background);
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
  color: var(--primary);
  margin-bottom: 1rem;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.user-management h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

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
  background-color: var(--card-background);
  font-weight: bold;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border);
}

.table-row {
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: var(--hover);
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
  border-top: 1px solid var(--border);
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

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