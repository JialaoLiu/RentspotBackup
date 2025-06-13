<template>
  <div ref="mapContainer" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  visitedProperties: {
    type: Array,
    default: () => []
  },
  updateAsItMoves: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['marker-click', 'bounds-changed', 'property-visited'])
const mapContainer = ref(null)
let map = null
let markers = []
let boundsChangedTimer = null

onMounted(() => {
  // Wait for Google Maps to load
  const mapCheckInterval = setInterval(() => {
    if (window.google && window.google.maps) {
      clearInterval(mapCheckInterval)
      initMap()
    }
  }, 200)

  // Clear interval after 10 seconds to prevent infinite checking
  setTimeout(() => clearInterval(mapCheckInterval), 10000)
})

function initMap() {
  if (!mapContainer.value) return
  
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.9285, lng: 138.6007 }, // Adelaide
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  })

  // Add property markers if available
  if (props.properties && props.properties.length) {
    addPropertyMarkers()
  }

  // Add map event listeners
  map.addListener('click', () => {
    emit('marker-click', null)
  })

  map.addListener('bounds_changed', () => {
    if (props.updateAsItMoves) {
      // Use debounce to prevent too many events
      clearTimeout(boundsChangedTimer)
      boundsChangedTimer = setTimeout(() => {
        const bounds = map.getBounds()
        if (bounds) {
          emit('bounds-changed', {
            north: bounds.getNorthEast().lat(),
            east: bounds.getNorthEast().lng(),
            south: bounds.getSouthWest().lat(),
            west: bounds.getSouthWest().lng()
          })
        }
      }, 500)
    }
  })
}

function addPropertyMarkers() {
  clearMarkers()
  
  props.properties.forEach(property => {
    if (property.lat && property.lng) {
      const position = {
        lat: parseFloat(property.lat),
        lng: parseFloat(property.lng)
      }
      
      // Determine marker color based on visited state
      const isVisited = props.visitedProperties.includes(property.id)
      
      // Create custom marker
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isVisited ? '#6B7280' : '#EF4444', // Gray for visited, red for unvisited
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8
      }
      
      const marker = new google.maps.Marker({
        position,
        map: map,
        title: property.title,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
        optimized: true,
        zIndex: isVisited ? 1 : 2 // Higher z-index for unvisited
      })
      
      // Add click event to marker
      marker.addListener('click', () => {
        // Emit visited property event when marker is clicked
        if (!props.visitedProperties.includes(property.id)) {
          emit('property-visited', property.id)
        }
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
    
    // Don't zoom in too far
    if (map.getZoom() > 15) {
      map.setZoom(15)
    }
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
    map.setZoom(15)
  }
}

function addMarker(position, title, clickHandler) {
  if (!map) return null
  
  try {
    const lat = typeof position.lat === 'string' ? parseFloat(position.lat) : position.lat
    const lng = typeof position.lng === 'string' ? parseFloat(position.lng) : position.lng
    
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
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

// Watch for changes in properties or visitedProperties
watch(() => props.properties, (newProperties) => {
  if (map && newProperties) {
    addPropertyMarkers()
  }
}, { deep: true })

watch(() => props.visitedProperties, () => {
  if (map && markers.length > 0) {
    // It's more efficient to just recreate all markers
    addPropertyMarkers()
  }
}, { deep: true })


// Expose methods to parent component
defineExpose({
  focusMap,
  addMarker,
  addPropertyMarkers
})
</script>