<template>
  <div class="property-management">
    <!-- Header Section -->
    <div class="management-header">
      <div class="header-content">
        <h1>Property Management</h1>
        <p v-if="userRole === 2" class="header-subtitle">Admin View - Manage All Properties</p>
        <p v-else class="header-subtitle">Manage Your Listed Properties</p>
        
        <div class="header-actions">
          <button @click="showAddForm" class="btn-add-property">
            <Icon name="plus" size="md" /> Add Property
          </button>
          <button @click="refreshProperties" class="btn-refresh" :disabled="loading">
            <Icon name="refresh" size="md" /> Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards (Admin only) -->
    <div v-if="userRole === 2" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card clickable" @click="setStatusFilter('')" :class="{ active: statusFilter === '' }">
          <div class="stat-number">{{ stats.total || 0 }}</div>
          <div class="stat-label">Total Properties</div>
        </div>
        <div class="stat-card clickable" @click="setStatusFilter('0')" :class="{ active: statusFilter === '0' }">
          <div class="stat-number">{{ stats.available || 0 }}</div>
          <div class="stat-label">Available</div>
        </div>
        <div class="stat-card clickable" @click="setStatusFilter('1')" :class="{ active: statusFilter === '1' }">
          <div class="stat-number">{{ stats.booked || 0 }}</div>
          <div class="stat-label">Rented</div>
        </div>
        <div class="stat-card clickable removed-card" @click="setStatusFilter('2')" :class="{ active: statusFilter === '2' }">
          <div class="stat-number">{{ stats.removed || 0 }}</div>
          <div class="stat-label">Removed</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search property title or address..." 
          class="search-input"
        />
      </div>
      
      <div class="filter-container">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="0">Available</option>
          <option value="1">Rented</option>
          <option value="2" v-if="userRole === 2">Removed</option>
        </select>
        
        <select v-model="typeFilter" class="filter-select">
          <option value="">All Types</option>
          <option value="0">House</option>
          <option value="1">Apartment</option>
          <option value="2">Townhouse</option>
          <option value="3">Villa</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <Icon name="error" size="xl" class="error-icon" /> {{ error }}
      <button @click="loadProperties" class="btn-retry">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProperties.length === 0 && !loading" class="empty-state">
      <div class="empty-content">
        <Icon name="house" size="xl" class="empty-icon" />
        <h3>{{ searchQuery ? 'No matching properties found' : 'No properties yet' }}</h3>
        <p v-if="!searchQuery">Click the "Add Property" button above to start adding your first property</p>
        <p v-else>Try adjusting your search criteria or filters</p>
      </div>
    </div>

    <!-- Properties Grid -->
    <div v-else class="properties-section">
      <div class="properties-grid">
        <PropertyManagementCard
          v-for="property in filteredProperties"
          :key="property.id"
          :property="property"
          @edit="showEditForm"
          @delete="showDeleteConfirm"
          @restore="showRestoreConfirm"
        />
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Property Form Modal -->
    <PropertyForm
      v-if="showForm"
      :mode="formMode"
      :property="editingProperty"
      @cancel="hideForm"
      @success="handleFormSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      v-if="showDeleteModal"
      :property="deletingProperty"
      @cancel="hideDeleteModal"
      @confirm="handleDelete"
    />
    
    <!-- Restore Confirmation Modal -->
    <ConfirmRestoreModal
      v-if="showRestoreModal"
      :property="restoringProperty"
      @cancel="hideRestoreModal"
      @confirm="handleRestore"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PropertyManagementCard from '../components/Property/Management/PropertyManagementCard.vue'
import PropertyForm from '../components/Property/Management/PropertyForm.vue'
import ConfirmDeleteModal from '../components/Property/Management/ConfirmDeleteModal.vue'
import ConfirmRestoreModal from '../components/Property/Management/ConfirmRestoreModal.vue'
import LoadingSpinner from '../components/Common/LoadingSpinner.vue'
import Icon from '../components/Common/Icon.vue'
import { getAllProperties, getMyProperties, getPropertyStats, deleteProperty, updateProperty } from '../services/propertyService'
import { useNotification } from '../composables/useNotification'

// Composables
const toast = useNotification()

// Reactive data
const properties = ref([])
const stats = ref({})
const loading = ref(false)
const error = ref('')

// Form state
const showForm = ref(false)
const formMode = ref('add')
const editingProperty = ref(null)

// Delete state
const showDeleteModal = ref(false)
const deletingProperty = ref(null)

// Restore state
const showRestoreModal = ref(false)
const restoringProperty = ref(null)

// Filters and search
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')


// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

// User info
const userRole = ref(0)

// Computed properties
const filteredProperties = computed(() => {
  let filtered = properties.value

  // For "Total Properties" view, exclude removed properties
  if (statusFilter.value === '') {
    filtered = filtered.filter(property => property.status !== 2)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(property =>
      property.title.toLowerCase().includes(query) ||
      property.address?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== '') {
    filtered = filtered.filter(property => 
      property.status === parseInt(statusFilter.value)
    )
  }

  // Type filter
  if (typeFilter.value !== '') {
    filtered = filtered.filter(property => 
      property.type === parseInt(typeFilter.value)
    )
  }

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})


const totalPages = computed(() => {
  let total = properties.value.length
  // Exclude removed properties from total count when showing all
  if (statusFilter.value === '') {
    total = properties.value.filter(p => p.status !== 2).length
  }
  return Math.ceil(total / itemsPerPage)
})

// Lifecycle
onMounted(() => {
  initializeComponent()
})

// Watchers
watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1
})

// Methods
async function initializeComponent() {
  // Get user info from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  userRole.value = userData.role || 0

  // Check permissions
  if (userRole.value < 1) {
    toast.error('You do not have permission to access this page')
    // Redirect to home or login
    return
  }

  await loadProperties()
  
  // Load stats for admin
  if (userRole.value === 2) {
    await loadStats()
  }
}

async function loadProperties() {
  loading.value = true
  error.value = ''

  try {
    let response
    if (userRole.value === 2) {
      // Admin: get all properties
      response = await getAllProperties()
    } else {
      // Landlord: get own properties (need to implement this API)
      response = await getMyProperties()
    }

    // Handle response - check if it's the full axios response or just data
    const data = response.data || response
    properties.value = data.properties || data || []
  } catch (err) {
    console.error('Load properties error:', err)
    error.value = err.response?.data?.message || 'Failed to load properties'
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response = await getPropertyStats()
    stats.value = response.data || response
  } catch (err) {
    console.error('Load stats error:', err)
  }
}

function refreshProperties() {
  loadProperties()
  if (userRole.value === 2) {
    loadStats()
  }
}

// Filter methods
function setStatusFilter(status) {
  statusFilter.value = status
  currentPage.value = 1
}

// Form methods
function showAddForm() {
  formMode.value = 'add'
  editingProperty.value = null
  showForm.value = true
}

function showEditForm(property) {
  formMode.value = 'edit'
  editingProperty.value = property
  showForm.value = true
}

function hideForm() {
  showForm.value = false
  editingProperty.value = null
}

function handleFormSuccess() {
  hideForm()
  refreshProperties()
}

// Delete methods
function showDeleteConfirm(property) {
  deletingProperty.value = property
  showDeleteModal.value = true
}

function hideDeleteModal() {
  showDeleteModal.value = false
  deletingProperty.value = null
}

async function handleDelete() {
  if (!deletingProperty.value) return

  const isPermanentDelete = deletingProperty.value.status === 2

  try {
    await deleteProperty(deletingProperty.value.id)
    toast.success(isPermanentDelete ? 'Property permanently deleted' : 'Property removed successfully')
    hideDeleteModal()
    refreshProperties()
  } catch (err) {
    console.error('Delete property error:', err)
    toast.error(
      err.response?.data?.message || 'Delete failed, please try again'
    )
  }
}

// Restore methods
function showRestoreConfirm(property) {
  restoringProperty.value = property
  showRestoreModal.value = true
}

function hideRestoreModal() {
  showRestoreModal.value = false
  restoringProperty.value = null
}

async function handleRestore() {
  if (!restoringProperty.value) return

  try {
    // Update property status to 0 (Available)
    await updateProperty(restoringProperty.value.id, { status: 0 })
    toast.success('Property restored successfully')
    hideRestoreModal()
    refreshProperties()
  } catch (err) {
    console.error('Restore property error:', err)
    toast.error(
      err.response?.data?.message || 'Restore failed, please try again'
    )
  }
}
</script>

<style scoped>
.property-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--surface-primary);
  min-height: 100vh;
}

/* Header Section */
.management-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0 0 24px 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-add-property,
.btn-refresh {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1;
}

.btn-add-property {
  background-color: #10B981;
  color: white;
}

.btn-add-property:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn-refresh {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add-property .icon,
.btn-refresh .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Statistics Section */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: var(--surface-elevated);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.stat-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.stat-card.active .stat-number,
.stat-card.active .stat-label {
  color: white;
}

.stat-card.removed-card.active {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background: var(--surface-elevated);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
}

.search-container {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  font-size: 16px;
  transition: border-color var(--transition-fast);
  background-color: var(--surface-primary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--interactive-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  background: var(--surface-primary);
  color: var(--text-primary);
  cursor: pointer;
}

/* Properties Section */
.properties-section {
  margin-bottom: 32px;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* States */
.error-state,
.empty-state {
  text-align: center;
  padding: 64px 32px;
  background: var(--surface-elevated);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: var(--text-tertiary);
}

.error-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: var(--interactive-danger);
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-add-property .icon,
.btn-refresh .icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}

.empty-state h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.btn-retry {
  background-color: var(--interactive-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 16px;
}

.btn-retry:hover {
  background-color: var(--interactive-primary-hover);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-secondary);
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-primary);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--surface-secondary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .property-management {
    padding: 16px;
  }
  
  .management-header {
    padding: 24px;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .properties-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>