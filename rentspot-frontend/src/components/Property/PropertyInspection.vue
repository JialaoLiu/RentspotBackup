<template>
  <div class="inspection-section">
    <h2>Book an Inspection</h2>
    
    <!-- Existing Booking Notice -->
    <div v-if="existingBooking" class="existing-booking">
      <h3>✅ You have an inspection booked</h3>
      <div class="booking-details">
        <div class="inspection-date">
          <div class="calendar-icon">📅</div>
          <div>
            <div class="day">{{ formatDay(existingBooking.booking_datetime) }}</div>
            <div class="date">{{ formatDate(existingBooking.booking_datetime) }}</div>
          </div>
        </div>
        <div class="inspection-hours">{{ formatTime(existingBooking.booking_datetime) }}</div>
      </div>
    </div>
    
    <!-- Available Slots -->
    <div v-else-if="availableSlots.length > 0" class="upcoming-inspections">
      <h3>Available Inspection Times</h3>
      <div v-if="loading" class="loading-state">
        Loading available times...
      </div>
      <div 
        v-for="(slot, index) in availableSlots" 
        :key="index" 
        class="inspection-time"
      >
        <div class="inspection-date">
          <div class="calendar-icon">📅</div>
          <div>
            <div class="day">{{ formatDay(slot.datetime) }}</div>
            <div class="date">{{ formatDate(slot.datetime) }}</div>
          </div>
        </div>
        <div class="inspection-hours">{{ formatTime(slot.datetime) }}</div>
        <button 
          class="register-button" 
          @click="bookInspection(slot)"
          :disabled="loading"
        >
          {{ loading ? 'Booking...' : 'Book Now' }}
        </button>
      </div>
    </div>
    
    <!-- No Slots Available -->
    <div v-else-if="!loading" class="no-slots">
      <h3>No inspection times available</h3>
      <p>Please check back later or request a custom inspection time below.</p>
    </div>
    
    <div class="request-inspection">
      <h3>Can't make these times?</h3>
      <button class="request-button" @click="showRequestForm = !showRequestForm">
        Request an inspection
      </button>
      
      <form v-if="showRequestForm" class="inspection-form" @submit.prevent="submitInspectionRequest">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="requestForm.name" 
            required 
            placeholder="Your full name"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="requestForm.email" 
            required 
            placeholder="Your email address"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Phone</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="requestForm.phone" 
            required 
            placeholder="Your phone number"
          >
        </div>
        
        <div class="form-group">
          <label for="preferred-date">Preferred Date</label>
          <input 
            type="date" 
            id="preferred-date" 
            v-model="requestForm.preferredDate" 
            required 
            :min="minDate"
          >
        </div>
        
        <div class="form-group">
          <label for="preferred-time">Preferred Time</label>
          <select id="preferred-time" v-model="requestForm.preferredTime" required>
            <option value="">Select a time</option>
            <option value="morning">Morning (9am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 7pm)</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="message">Additional Comments</label>
          <textarea 
            id="message" 
            v-model="requestForm.message" 
            rows="3" 
            placeholder="Any specific requirements or questions"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="submit-button">Submit Request</button>
          <button type="button" class="cancel-button" @click="showRequestForm = false">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bookingService from '../../services/bookingService'
import { useNotification } from '../../composables/useNotification'
import { useRouter } from '../../composables/useRouter'

const props = defineProps({
  propertyId: Number,
  address: String
})

const toast = useNotification()
const { push } = useRouter()

const isAuthenticated = computed(() => !!localStorage.getItem('token'))
const showRequestForm = ref(false)
const loading = ref(false)
const availableSlots = ref([])
const existingBooking = ref(null)

const requestForm = ref({
  name: '',
  email: '',
  phone: '',
  preferredDate: '',
  preferredTime: '',
  message: ''
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

onMounted(() => {
  loadAvailableSlots()
  checkExistingBooking()
})

async function loadAvailableSlots() {
  try {
    loading.value = true
    const response = await bookingService.getAvailableSlots(props.propertyId)
    availableSlots.value = response.data.slots
  } catch (error) {
    console.error('Error loading available slots:', error)
    toast.error('Failed to load inspection times')
  } finally {
    loading.value = false
  }
}

async function checkExistingBooking() {
  if (!isAuthenticated.value) return
  
  try {
    const response = await bookingService.getUserBookings()
    const userBookings = response.data.bookings
    
    // Check if user has existing booking for this property
    existingBooking.value = userBookings.find(
      booking => booking.booking_property_id === props.propertyId && 
                booking.booking_status === 1 // Confirmed
    )
  } catch (error) {
    console.error('Error checking existing booking:', error)
  }
}

function formatDay(date) {
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-AU', { weekday: 'short' })
}

function formatDate(date) {
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function formatTime(date) {
  const dateObj = new Date(date)
  return dateObj.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

async function bookInspection(slot) {
  if (!isAuthenticated.value) {
    toast.error('Please login to book an inspection')
    push('/login')
    return
  }
  
  if (existingBooking.value) {
    toast.error('You already have a booking for this property')
    return
  }
  
  try {
    loading.value = true
    
    const bookingData = {
      propertyId: props.propertyId,
      datetime: slot.datetime
    }
    
    await bookingService.createBooking(bookingData)
    toast.success('Inspection booked successfully!')
    
    // Refresh bookings
    await checkExistingBooking()
    
  } catch (error) {
    console.error('Error booking inspection:', error)
    const message = error.response?.data?.message || 'Failed to book inspection'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

function submitInspectionRequest() {
  // For MVP, show simple message - can be enhanced later
  toast.info('Inspection request feature coming soon. Please use the available time slots.')
  showRequestForm.value = false
}
</script>

<style scoped>
.inspection-section {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.inspection-section h2 {
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: #1f2937;
}

.upcoming-inspections h3, .request-inspection h3 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #4b5563;
}

.inspection-time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.inspection-date {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar-icon {
  font-size: 1.5rem;
}

.day {
  font-weight: bold;
  color: #1f2937;
}

.date {
  color: #6b7280;
}

.inspection-hours {
  font-weight: 500;
  color: #4b5563;
}

.register-button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.register-button:hover {
  background-color: #2563eb;
}

.register-button:disabled {
  background-color: #93c5fd;
  cursor: default;
}

.request-inspection {
  margin-top: 24px;
}

.request-button {
  width: 100%;
  padding: 12px;
  background-color: #f3f4f6;
  color: #1f2937;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.request-button:hover {
  background-color: #e5e7eb;
}

.inspection-form {
  margin-top: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #4b5563;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.submit-button {
  flex: 1;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  padding: 12px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.existing-booking {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.existing-booking h3 {
  color: #166534;
  margin-bottom: 12px;
}

.booking-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.no-slots {
  text-align: center;
  padding: 32px;
  background-color: #f8fafc;
  border-radius: 6px;
  margin-bottom: 20px;
}

.no-slots h3 {
  color: #64748b;
  margin-bottom: 8px;
}

.no-slots p {
  color: #94a3b8;
}

.loading-state {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-style: italic;
}
</style>