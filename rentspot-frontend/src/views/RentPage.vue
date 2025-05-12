<template>
    <div class="rentpage-container">
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <p>Loading property details...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="goBack" class="back-button">Go Back</button>
      </div>
      
      <!-- Property details -->
      <div v-else-if="property" class="property-details">
        <div class="property-header">
          <h1>{{ property.title }}</h1>
          <p class="property-address">{{ property.address }}</p>
          <div class="property-price">${{ property.price }}/week</div>
        </div>
        
        <div class="property-gallery">
          <img :src="property.image" :alt="property.title" class="main-image" @error="handleImageError">
          <!-- Additional images could be added here in the future -->
        </div>
        
        <div class="property-features">
          <div class="feature">
            <span class="feature-icon">🛏️</span>
            <span class="feature-value">{{ property.bedrooms }}</span>
            <span class="feature-label">Bedrooms</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🚿</span>
            <span class="feature-value">{{ property.bathrooms }}</span>
            <span class="feature-label">Bathrooms</span>
          </div>
          <div class="feature" v-if="property.garages">
            <span class="feature-icon">🚗</span>
            <span class="feature-value">{{ property.garages }}</span>
            <span class="feature-label">Garage Spaces</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🏠</span>
            <span class="feature-value">{{ getPropertyType(property.type) }}</span>
            <span class="feature-label">Property Type</span>
          </div>
        </div>
        
        <div class="property-description">
          <h2>Description</h2>
          <p>{{ property.description }}</p>
          <p v-if="!property.description">No description available for this property.</p>
        </div>
        
        <div class="map-section">
          <h2>Location</h2>
          <div class="map-container" ref="mapContainer"></div>
        </div>
        
        <div class="agent-section">
          <h2>Contact Agent</h2>
          <div class="agent-details">
            <div class="agent-photo">
              <!-- Placeholder for agent photo -->
              <div class="agent-placeholder">👤</div>
            </div>
            <div class="agent-info">
              <h3>Property Manager</h3>
              <p>Email: agent@rentspot.com.au</p>
              <p>Phone: (08) 1234 5678</p>
            </div>
          </div>
          <div class="contact-buttons">
            <button class="email-button">Email Agent</button>
            <button class="call-button">Call Agent</button>
            <button class="inspection-button">Book Inspection</button>
          </div>
        </div>
      </div>
      
      <!-- Property not found -->
      <div v-else class="not-found">
        <h2>Property Not Found</h2>
        <p>Sorry, we couldn't find the property you were looking for.</p>
        <button @click="goBack" class="back-button">Back to Listings</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { getPropertyById } from '../services/propertyService'
  
  const router = useRouter()
  const route = useRoute()
  const property = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const mapContainer = ref(null)
  let map = null
  let marker = null
  
  onMounted(async () => {
    const id = parseInt(route.params.id)
    
    if (!id) {
      error.value = 'Invalid property ID'
      loading.value = false
      return
    }
    
    try {
      // Fetch property details
      const data = await getPropertyById(id)
      
      if (!data) {
        // Property not found
        loading.value = false
        return
      }
      
      property.value = data
      
      // Initialize map after data is loaded
      setTimeout(() => {
        initMap()
      }, 500)
    } catch (err) {
      console.error('Error fetching property:', err)
      error.value = 'Failed to load property details. Please try again later.'
    } finally {
      loading.value = false
    }
  })
  
  function initMap() {
    if (!mapContainer.value || !property.value || !property.value.lat || !property.value.lng) return
    
    if (!window.google || !window.google.maps) {
      // Wait for Google Maps to load
      const mapInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(mapInterval)
          createMap()
        }
      }, 200)
      
      // Clear interval after timeout
      setTimeout(() => clearInterval(mapInterval), 5000)
      return
    }
    
    createMap()
  }
  
  function createMap() {
    const lat = parseFloat(property.value.lat)
    const lng = parseFloat(property.value.lng)
    
    map = new google.maps.Map(mapContainer.value, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: true
    })
    
    // Add marker for property
    marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title: property.value.title,
      animation: google.maps.Animation.DROP
    })
  }
  
  function getPropertyType(typeCode) {
    const types = {
      0: 'House',
      1: 'Apartment',
      2: 'Townhouse',
      3: 'Villa'
    }
    
    return types[typeCode] || 'Property'
  }
  
  function handleImageError(e) {
    e.target.src = 'https://via.placeholder.com/800x600?text=Property+Image+Not+Available'
  }
  
  function goBack() {
    router.back()
  }
  </script>
  
  <style scoped>
  .rentpage-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .loading-container, .error-container, .not-found {
    text-align: center;
    padding: 100px 0;
  }
  
  .error-container {
    color: #d32f2f;
  }
  
  .back-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .property-header {
    margin-bottom: 20px;
  }
  
  .property-header h1 {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .property-address {
    color: #6b7280;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  
  .property-price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #3b82f6;
    margin-bottom: 8px;
  }
  
  .property-gallery {
    margin-bottom: 30px;
  }
  
  .main-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .property-features {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f9fafb;
    border-radius: 8px;
  }
  
  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 120px;
  }
  
  .feature-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .feature-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .feature-label {
    color: #6b7280;
  }
  
  .property-description {
    margin-bottom: 30px;
  }
  
  .property-description h2 {
    margin-bottom: 16px;
    font-size: 1.5rem;
  }
  
  .map-section {
    margin-bottom: 30px;
  }
  
  .map-section h2 {
    margin-bottom: 16px;
    font-size: 1.5rem;
  }
  
  .map-container {
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .agent-section {
    margin-bottom: 30px;
  }
  
  .agent-section h2 {
    margin-bottom: 16px;
    font-size: 1.5rem;
  }
  
  .agent-details {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .agent-photo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .agent-placeholder {
    font-size: 2.5rem;
    color: #9ca3af;
  }
  
  .agent-info h3 {
    margin-bottom: 8px;
  }
  
  .contact-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .contact-buttons button {
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .email-button {
    background-color: #f3f4f6;
    color: #1f2937;
  }
  
  .call-button {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  
  .inspection-button {
    background-color: #3b82f6;
    color: white;
  }
  
  @media (max-width: 768px) {
    .property-features {
      gap: 10px;
    }
    
    .feature {
      min-width: 90px;
    }
    
    .agent-details {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .contact-buttons {
      flex-direction: column;
    }
    
    .contact-buttons button {
      width: 100%;
    }
  }
  </style>