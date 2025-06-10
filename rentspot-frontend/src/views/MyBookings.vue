<template>
  <div class="my-bookings">
    <div class="bookings-header">
      <h1>My Inspection Bookings</h1>
      <p>Manage all your property inspection bookings</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your bookings...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookings.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <h3>No bookings yet</h3>
      <p>You haven't booked any property inspections yet.</p>
      <router-link to="/rentlist" class="btn-browse">
        Browse Properties
      </router-link>
    </div>

    <!-- Bookings List -->
    <div v-else class="bookings-list">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          :class="['tab', { active: activeFilter === 'all' }]"
          @click="activeFilter = 'all'"
        >
          All Bookings ({{ bookings.length }})
        </button>
        <button 
          :class="['tab', { active: activeFilter === 'upcoming' }]"
          @click="activeFilter = 'upcoming'"
        >
          Upcoming ({{ upcomingBookings.length }})
        </button>
        <button 
          :class="['tab', { active: activeFilter === 'past' }]"
          @click="activeFilter = 'past'"
        >
          Past ({{ pastBookings.length }})
        </button>
      </div>

      <!-- Booking Cards -->
      <div class="booking-cards">
        <div 
          v-for="booking in filteredBookings" 
          :key="booking.booking_id"
          class="booking-card"
          :class="getBookingStatusClass(booking)"
        >
          <!-- Property Image -->
          <div class="property-image">
            <img 
              :src="booking.image || '/images/placeholder.jpg'" 
              :alt="booking.title"
              @error="handleImageError"
            />
          </div>

          <!-- Booking Details -->
          <div class="booking-details">
            <h3 class="property-title">{{ booking.title }}</h3>
            <p class="property-address">{{ booking.address }}</p>
            
            <div class="booking-info">
              <div class="booking-time">
                <span class="icon">📅</span>
                <div>
                  <div class="date">{{ formatDate(booking.booking_datetime) }}</div>
                  <div class="time">{{ formatTime(booking.booking_datetime) }}</div>
                </div>
              </div>
              
              <div class="booking-status">
                <span :class="['status-badge', getStatusClass(booking.booking_status)]">
                  {{ getStatusText(booking.booking_status) }}
                </span>
              </div>
            </div>

            <!-- Owner Contact -->
            <div class="owner-contact">
              <div class="owner-info">
                <span class="icon">👤</span>
                <div>
                  <div class="owner-name">{{ booking.owner_name }}</div>
                  <div class="owner-details">
                    {{ booking.owner_email }} • {{ booking.owner_phone }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="booking-actions">
            <button 
              v-if="canCancel(booking)"
              class="btn-cancel"
              @click="cancelBooking(booking)"
              :disabled="cancelling === booking.booking_id"
            >
              {{ cancelling === booking.booking_id ? 'Cancelling...' : 'Cancel' }}
            </button>
            
            <router-link 
              :to="`/rentpage/${booking.booking_property_id}`"
              class="btn-view"
            >
              View Property
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RouterLink from '../components/RouterLink.vue'
import bookingService from '../services/bookingService'
import { useNotification } from '../composables/useNotification'

const toast = useNotification()

const loading = ref(false)
const cancelling = ref(null)
const bookings = ref([])
const activeFilter = ref('all')

onMounted(() => {
  loadBookings()
})

async function loadBookings() {
  try {
    loading.value = true
    const response = await bookingService.getUserBookings()
    bookings.value = response.data.bookings
  } catch (error) {
    console.error('Error loading bookings:', error)
    toast.error('Failed to load bookings')
  } finally {
    loading.value = false
  }
}

const upcomingBookings = computed(() => {
  const now = new Date()
  return bookings.value.filter(booking => {
    const bookingDate = new Date(booking.booking_datetime)
    return bookingDate > now && booking.booking_status === 1
  })
})

const pastBookings = computed(() => {
  const now = new Date()
  return bookings.value.filter(booking => {
    const bookingDate = new Date(booking.booking_datetime)
    return bookingDate <= now || booking.booking_status === 3
  })
})

const filteredBookings = computed(() => {
  switch (activeFilter.value) {
    case 'upcoming':
      return upcomingBookings.value
    case 'past':
      return pastBookings.value
    default:
      return bookings.value
  }
})

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

function getStatusText(status) {
  const statusMap = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'Cancelled',
    3: 'Completed'
  }
  return statusMap[status] || 'Unknown'
}

function getStatusClass(status) {
  const classMap = {
    0: 'pending',
    1: 'confirmed',
    2: 'cancelled',
    3: 'completed'
  }
  return classMap[status] || 'unknown'
}

function getBookingStatusClass(booking) {
  const now = new Date()
  const bookingDate = new Date(booking.booking_datetime)
  
  if (booking.booking_status === 2) return 'cancelled'
  if (booking.booking_status === 3) return 'completed'
  if (bookingDate < now) return 'past'
  return 'upcoming'
}

function canCancel(booking) {
  if (booking.booking_status !== 1) return false
  
  const bookingTime = new Date(booking.booking_datetime)
  const now = new Date()
  const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000))
  
  return bookingTime > fourHoursFromNow
}

async function cancelBooking(booking) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return
  }
  
  try {
    cancelling.value = booking.booking_id
    await bookingService.cancelBooking(booking.booking_id)
    
    // Update local state
    const index = bookings.value.findIndex(b => b.booking_id === booking.booking_id)
    if (index !== -1) {
      bookings.value[index].booking_status = 2
    }
    
    toast.success('Booking cancelled successfully')
  } catch (error) {
    console.error('Error cancelling booking:', error)
    const message = error.response?.data?.message || 'Failed to cancel booking'
    toast.error(message)
  } finally {
    cancelling.value = null
  }
}

function handleImageError(event) {
  event.target.src = '/images/placeholder.jpg'
}
</script>

<style scoped>
.my-bookings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--surface-primary);
  min-height: 100vh;
}

.bookings-header {
  text-align: center;
  margin-bottom: 32px;
}

.bookings-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.bookings-header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.loading-state {
  text-align: center;
  padding: 64px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--surface-secondary);
  border-top: 4px solid var(--interactive-primary);
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
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-browse {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--interactive-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast);
}

.btn-browse:hover {
  background-color: var(--interactive-primary-hover);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-primary);
}

.tab {
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--interactive-primary);
  border-bottom-color: var(--interactive-primary);
}

.booking-cards {
  display: grid;
  gap: 24px;
}

.booking-card {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 20px;
  background: var(--surface-elevated);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--border-primary);
  transition: all var(--transition-fast);
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.booking-card.upcoming {
  border-left-color: #10b981;
}

.booking-card.past {
  border-left-color: #6b7280;
}

.booking-card.cancelled {
  border-left-color: #ef4444;
  opacity: 0.7;
}

.booking-card.completed {
  border-left-color: #8b5cf6;
}

.property-image {
  width: 200px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-details {
  flex: 1;
}

.property-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.property-address {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.booking-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.booking-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.booking-time .icon {
  font-size: 1.2rem;
}

.date {
  font-weight: 500;
  color: var(--text-primary);
}

.time {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.completed {
  background-color: #ede9fe;
  color: #5b21b6;
}

.owner-contact {
  margin-top: 16px;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-weight: 500;
  color: var(--text-primary);
}

.owner-details {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  min-width: 120px;
}

.btn-cancel, .btn-view {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #fecaca;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-view {
  background-color: var(--color-primary-light);
  color: var(--interactive-primary);
}

.btn-view:hover {
  background-color: var(--surface-secondary);
}

@media (max-width: 768px) {
  .my-bookings {
    padding: 16px;
  }
  
  .booking-card {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .property-image {
    width: 100%;
    height: 200px;
  }
  
  .booking-actions {
    flex-direction: row;
  }
  
  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>