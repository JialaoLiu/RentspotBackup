<template>
  <div class="my-property">
    <div class="property-header">
      <h1>My Properties</h1>
      <p>Manage your property listings and bookings</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your properties...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="properties.length === 0" class="empty-state">
      <div class="empty-icon">🏠</div>
      <h3>No properties listed yet</h3>
      <p>You haven't listed any properties for rent yet.</p>
      <router-link to="/property/manage" class="btn-add">
        Add Your First Property
      </router-link>
    </div>

    <!-- Properties List -->
    <div v-else class="properties-list">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="['tab', { active: activeFilter === 'all' }]"
          @click="activeFilter = 'all'"
        >
          All Properties ({{ properties.length }})
        </button>
        <button 
          :class="['tab', { active: activeFilter === 'available' }]"
          @click="activeFilter = 'available'"
        >
          Available ({{ availableProperties.length }})
        </button>
        <button 
          :class="['tab', { active: activeFilter === 'rented' }]"
          @click="activeFilter = 'rented'"
        >
          Rented ({{ rentedProperties.length }})
        </button>
      </div>

      <!-- Property Cards -->
      <div class="property-cards">
        <div 
          v-for="property in filteredProperties" 
          :key="property.id"
          class="property-card"
          :class="getPropertyStatusClass(property)"
        >
          <!-- Property Image -->
          <div class="property-image">
            <img 
              :src="property.image || '/images/placeholder.jpg'" 
              :alt="property.title"
              @error="handleImageError"
            />
            <div class="status-badge" :class="getStatusClass(property.status)">
              {{ getStatusText(property.status) }}
            </div>
          </div>

          <!-- Property Details -->
          <div class="property-details">
            <h3 class="property-title">{{ property.title }}</h3>
            <p class="property-address">{{ property.property_address || property.address }}</p>
            
            <div class="property-info">
              <div class="property-price">
                <span class="icon">💰</span>
                <div>
                  <div class="price">${{ property.price }}/week</div>
                  <div class="type">{{ property.property_type }}</div>
                </div>
              </div>
              
              <div class="property-features">
                <span class="feature">🛏️ {{ property.bedrooms }} bed</span>
                <span class="feature">🚿 {{ property.bathrooms }} bath</span>
                <span v-if="property.garage" class="feature">🚗 {{ property.garage }} car</span>
              </div>
            </div>

            <!-- Booking Stats -->
            <div v-if="property.bookingStats" class="booking-stats">
              <div class="stat-item">
                <span class="stat-label">Total Bookings:</span>
                <span class="stat-value">{{ property.bookingStats.total || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">This Week:</span>
                <span class="stat-value">{{ property.bookingStats.thisWeek || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="property-actions">
            <router-link 
              :to="`/rentpage/${property.id}`"
              class="btn-view"
            >
              View Listing
            </router-link>
            
            <button 
              class="btn-bookings"
              @click="viewBookings(property)"
            >
              Bookings ({{ property.bookingStats?.total || 0 }})
            </button>
            
            <router-link 
              to="/property/manage"
              class="btn-edit"
            >
              Edit Property
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Bookings Modal -->
    <div v-if="showBookingsModal" class="modal-overlay" @click="closeBookingsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Bookings for {{ selectedProperty?.title }}</h3>
          <button class="modal-close" @click="closeBookingsModal">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingBookings" class="loading-bookings">
            <div class="spinner-small"></div>
            <p>Loading bookings...</p>
          </div>
          
          <div v-else-if="propertyBookings.length === 0" class="no-bookings">
            <p>No bookings for this property yet.</p>
          </div>
          
          <div v-else class="bookings-list">
            <div 
              v-for="booking in propertyBookings" 
              :key="booking.booking_id"
              class="booking-item"
              :class="getBookingStatusClass(booking)"
            >
              <div class="booking-info">
                <div class="renter-name">{{ booking.renter_name }}</div>
                <div class="booking-datetime">
                  {{ formatDate(booking.booking_datetime) }} at {{ formatTime(booking.booking_datetime) }}
                </div>
                <div class="renter-contact">{{ booking.renter_email }} • {{ booking.renter_phone }}</div>
              </div>
              <div class="booking-status">
                <span :class="['status-badge', getBookingStatusClass(booking)]">
                  {{ getBookingStatusText(booking.booking_status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RouterLink from '../components/RouterLink.vue'
import propertyService from '../services/propertyService'
import bookingService from '../services/bookingService'
import { useNotification } from '../composables/useNotification'

const toast = useNotification()

const loading = ref(false)
const loadingBookings = ref(false)
const properties = ref([])
const activeFilter = ref('all')
const showBookingsModal = ref(false)
const selectedProperty = ref(null)
const propertyBookings = ref([])

onMounted(() => {
  loadProperties()
})

async function loadProperties() {
  try {
    loading.value = true
    const response = await propertyService.getMyProperties()
    properties.value = response.data.properties || []
    
    // Set default booking stats (load actual stats when viewing bookings)
    for (const property of properties.value) {
      property.bookingStats = { total: 0, thisWeek: 0 }
    }
  } catch (error) {
    console.error('Error loading properties:', error)
    toast.error('Failed to load properties')
  } finally {
    loading.value = false
  }
}

const availableProperties = computed(() => {
  return properties.value.filter(property => property.status === 0)
})

const rentedProperties = computed(() => {
  return properties.value.filter(property => property.status === 1)
})

const filteredProperties = computed(() => {
  switch (activeFilter.value) {
    case 'available':
      return availableProperties.value
    case 'rented':
      return rentedProperties.value
    default:
      return properties.value
  }
})

function getStatusText(status) {
  const statusMap = {
    0: 'Available',
    1: 'Rented',
    2: 'Removed'
  }
  return statusMap[status] || 'Unknown'
}

function getStatusClass(status) {
  const classMap = {
    0: 'available',
    1: 'rented',
    2: 'removed'
  }
  return classMap[status] || 'unknown'
}

function getPropertyStatusClass(property) {
  if (property.status === 0) return 'available'
  if (property.status === 1) return 'rented'
  if (property.status === 2) return 'removed'
  return 'unknown'
}

function getBookingStatusText(status) {
  const statusMap = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'Cancelled',
    3: 'Completed'
  }
  return statusMap[status] || 'Unknown'
}

function getBookingStatusClass(booking) {
  const now = new Date()
  const bookingDate = new Date(booking.booking_datetime)
  
  if (booking.booking_status === 2) return 'cancelled'
  if (booking.booking_status === 3) return 'completed'
  if (bookingDate < now) return 'past'
  return 'upcoming'
}

async function viewBookings(property) {
  selectedProperty.value = property
  showBookingsModal.value = true
  
  try {
    loadingBookings.value = true
    const response = await bookingService.getPropertyBookings(property.id)
    const bookings = response.data.bookings || []
    propertyBookings.value = bookings
    
    // Update booking stats for this property
    const total = bookings.length
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const thisWeek = bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_datetime)
      return bookingDate >= oneWeekAgo
    }).length
    
    // Find and update the property in the list
    const propertyIndex = properties.value.findIndex(p => p.id === property.id)
    if (propertyIndex !== -1) {
      properties.value[propertyIndex].bookingStats = { total, thisWeek }
    }
  } catch (error) {
    console.error('Error loading property bookings:', error)
    toast.error('Failed to load bookings')
  } finally {
    loadingBookings.value = false
  }
}

function closeBookingsModal() {
  showBookingsModal.value = false
  selectedProperty.value = null
  propertyBookings.value = []
}

function formatDate(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString('en-AU', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(datetime) {
  const date = new Date(datetime)
  return date.toLocaleTimeString('en-AU', { 
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleImageError(event) {
  event.target.src = '/images/placeholder.jpg'
}
</script>

<style scoped>
.my-property {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.property-header {
  text-align: center;
  margin-bottom: 32px;
}

.property-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 8px;
}

.property-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.loading-state {
  text-align: center;
  padding: 64px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background-color: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #059669;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #10b981;
  border-bottom-color: #10b981;
}

.property-cards {
  display: grid;
  gap: 24px;
}

.property-card {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s;
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.property-card.available {
  border-left-color: #10b981;
}

.property-card.rented {
  border-left-color: #f59e0b;
}

.property-card.removed {
  border-left-color: #ef4444;
  opacity: 0.7;
}

.property-image {
  width: 200px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
}

.status-badge.available {
  color: #065f46;
  background-color: rgba(209, 250, 229, 0.9);
}

.status-badge.rented {
  color: #92400e;
  background-color: rgba(254, 243, 199, 0.9);
}

.status-badge.removed {
  color: #991b1b;
  background-color: rgba(254, 226, 226, 0.9);
}

.property-details {
  flex: 1;
}

.property-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.property-address {
  color: #6b7280;
  margin-bottom: 16px;
}

.property-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.property-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.property-price .icon {
  font-size: 1.2rem;
}

.price {
  font-weight: 600;
  color: #374151;
  font-size: 1.1rem;
}

.type {
  color: #6b7280;
  font-size: 0.9rem;
}

.property-features {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.feature {
  font-size: 0.9rem;
  color: #6b7280;
}

.booking-stats {
  display: flex;
  gap: 16px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.stat-value {
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.property-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  min-width: 140px;
}

.btn-view, .btn-bookings, .btn-edit {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-view {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.btn-view:hover {
  background-color: #bfdbfe;
}

.btn-bookings {
  background-color: #ecfdf5;
  color: #065f46;
}

.btn-bookings:hover {
  background-color: #d1fae5;
}

.btn-edit {
  background-color: #fef3c7;
  color: #92400e;
}

.btn-edit:hover {
  background-color: #fed7aa;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.loading-bookings {
  text-align: center;
  padding: 32px;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 8px;
}

.no-bookings {
  text-align: center;
  padding: 32px;
  color: #6b7280;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.booking-item.upcoming {
  border-left: 4px solid #10b981;
}

.booking-item.past {
  border-left: 4px solid #6b7280;
}

.booking-item.cancelled {
  border-left: 4px solid #ef4444;
  opacity: 0.7;
}

.booking-item.completed {
  border-left: 4px solid #8b5cf6;
}

.booking-info {
  flex: 1;
}

.renter-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.booking-datetime {
  color: #374151;
  margin-bottom: 4px;
}

.renter-contact {
  color: #6b7280;
  font-size: 0.9rem;
}

.booking-status .status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.booking-status .status-badge.upcoming {
  background-color: #d1fae5;
  color: #065f46;
}

.booking-status .status-badge.past {
  background-color: #f3f4f6;
  color: #374151;
}

.booking-status .status-badge.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.booking-status .status-badge.completed {
  background-color: #ede9fe;
  color: #5b21b6;
}

@media (max-width: 768px) {
  .my-property {
    padding: 16px;
  }
  
  .property-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .property-image {
    width: 100%;
    height: 200px;
  }
  
  .property-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .property-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .booking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>