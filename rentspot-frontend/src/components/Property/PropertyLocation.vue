<template>
  <div class="map-section">
    <h2>Location</h2>
    <p class="location-address">{{ address }}</p>
    <div class="map-container" ref="mapContainer"></div>
    <div class="map-actions">
      <a 
        :href="googleMapsUrl" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="map-action-button"
      >
        Open in Google Maps
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  lat: [Number, String],
  lng: [Number, String],
  address: String
})

const mapContainer = ref(null)
let map = null
let marker = null

const googleMapsUrl = computed(() => {
  const lat = parseFloat(props.lat)
  const lng = parseFloat(props.lng)
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
})

onMounted(() => {
  // Initialize map after component is mounted
  setTimeout(() => {
    initMap()
  }, 500)
})

function initMap() {
  if (!mapContainer.value || !props.lat || !props.lng) return
  
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
  const lat = parseFloat(props.lat)
  const lng = parseFloat(props.lng)
  
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
    title: props.address,
    animation: google.maps.Animation.DROP
  })
}
</script>

<style scoped>
.map-section {
  margin-bottom: 30px;
}

.map-section h2 {
  margin-bottom: 10px;
  font-size: 1.5rem;
  color: #1f2937;
}

.location-address {
  margin-bottom: 16px;
  color: #4b5563;
}

.map-container {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.map-actions {
  display: flex;
  justify-content: flex-end;
}

.map-action-button {
  display: inline-block;
  padding: 8px 12px;
  background-color: #f3f4f6;
  color: #1f2937;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.map-action-button:hover {
  background-color: #e5e7eb;
}
</style>