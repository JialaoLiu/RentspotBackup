<template>
  <div ref="mapContainer" style="width: 100%; height: 100%; border: 1px solid #ccc; border-radius: 8px;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['marker-click'])
const mapContainer = ref(null)
let map = null
let markers = []

onMounted(() => {
  // Wait for Google Maps to load
  const mapCheckInterval = setInterval(() => {
    if (window.google && window.google.maps) {
      clearInterval(mapCheckInterval)
      initMap()
    }
  }, 200)

  // Clear interval after 10 seconds (50 * 200ms) to prevent infinite checking
  setTimeout(() => clearInterval(mapCheckInterval), 10000)
})

function initMap() {
  if (!mapContainer.value) return
  
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.9285, lng: 138.6007 }, // Adelaide
    zoom: 12
  })

  // Add property markers if available
  if (props.properties && props.properties.length) {
    addPropertyMarkers()
  }
}

function addPropertyMarkers() {
  clearMarkers()
  
  props.properties.forEach(property => {
    if (property.lat && property.lng) {
      const position = {
        lat: parseFloat(property.lat),
        lng: parseFloat(property.lng)
      }
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: property.title
      })
      
      // Add click event to marker
      marker.addListener('click', () => {
        emit('marker-click', property)
      })
      
      markers.push(marker)
    }
  })
  
  // If we have markers, fit the map to show all of them
  if (markers.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    markers.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
    map.fitBounds(bounds)
  }
}

function addMarker(position, title, clickHandler) {
  if (!map) return null
  
  try {
    const lat = typeof position.lat === 'string' ? parseFloat(position.lat) : position.lat
    const lng = typeof position.lng === 'string' ? parseFloat(position.lng) : position.lng
    
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      title,
      animation: google.maps.Animation.DROP
    })
    
    // Add click handler
    if (clickHandler) {
      marker.addListener('click', clickHandler)
    }
    
    markers.push(marker)
    return marker
  } catch (error) {
    console.error('Error creating marker:', error)
    return null
  }
}

function clearMarkers() {
  markers.forEach(marker => {
    marker.setMap(null)
  })
  markers = []
}

function focusMap(position) {
  if (map) {
    map.panTo(position)
    map.setZoom(14)

    // Remove previous marker if exists
    clearMarkers()

    // Add new marker
    const marker = new google.maps.Marker({
      position,
      map,
      title: 'Selected Property',
      animation: google.maps.Animation.DROP
    })
    
    markers.push(marker)
  }
}

defineExpose({ 
  focusMap,
  addMarker,
  addPropertyMarkers
})
</script>