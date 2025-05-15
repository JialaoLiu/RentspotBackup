<template>
  <div class="inspection-section">
    <h2>Book an Inspection</h2>
    
    <div v-if="upcomingInspections.length > 0" class="upcoming-inspections">
      <h3>Upcoming Inspections</h3>
      <div 
        v-for="(inspection, index) in upcomingInspections" 
        :key="index" 
        class="inspection-time"
      >
        <div class="inspection-date">
          <div class="calendar-icon">📅</div>
          <div>
            <div class="day">{{ formatDay(inspection.date) }}</div>
            <div class="date">{{ formatDate(inspection.date) }}</div>
          </div>
        </div>
        <div class="inspection-hours">{{ formatTimeRange(inspection.startTime, inspection.endTime) }}</div>
        <button 
          class="register-button" 
          @click="registerForInspection(inspection.id)"
          :disabled="inspection.registered"
        >
          {{ inspection.registered ? 'Registered' : 'Register' }}
        </button>
      </div>
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
import { ref, computed } from 'vue'
// Removed the import for useAuthStore

const props = defineProps({
  propertyId: Number,
  address: String
})

// Replace with temporary auth store
const authStore = {
  isAuthenticated: ref(!!localStorage.getItem('token'))
}

const showRequestForm = ref(false)
const requestSubmitted = ref(false)

// Sample data - would come from API in real application
const upcomingInspections = ref([
  {
    id: 1,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    startTime: '10:00',
    endTime: '10:30',
    registered: false
  },
  {
    id: 2,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    startTime: '13:00',
    endTime: '13:30',
    registered: false
  }
])

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

function formatDay(date) {
  return date.toLocaleDateString('en-AU', { weekday: 'short' })
}

function formatDate(date) {
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function formatTimeRange(start, end) {
  return `${start} - ${end}`
}

function registerForInspection(inspectionId) {
  if (!authStore.isAuthenticated.value) {
    // Redirect to login
    return
  }
  
  // Find and update the inspection
  const inspection = upcomingInspections.value.find(i => i.id === inspectionId)
  if (inspection) {
    inspection.registered = true
    // Would call API to register in real app
  }
}

function submitInspectionRequest() {
  // In a real app, this would submit the form data to an API
  console.log('Submitting inspection request:', requestForm.value)
  
  // Reset form and show confirmation
  requestSubmitted.value = true
  showRequestForm.value = false
  requestForm.value = {
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  }
  
  // Show success message (would be handled better in real app)
  alert('Your inspection request has been submitted. An agent will contact you shortly.')
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
</style>