<template>
  <div class="mt-8 px-4">
    <h2 class="text-xl font-semibold mb-4">Map Preview</h2>
    <div
      ref="mapContainer"
      style="width: 100%; height: 400px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px;"
    >
      <div v-if="!isMapLoaded" style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <p>Loading map...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const mapContainer = ref(null)
const isMapLoaded = ref(false)
let map = null
let markers = []

// Wait for Google Maps to load
function waitForGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      return resolve()
    }

    let retries = 0
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps)
        return resolve()
      }

      retries++
      if (retries > 20) { // 10 seconds timeout
        clearInterval(checkGoogleMaps)
        return reject(new Error('Google Maps failed to load'))
      }
    }, 500)
  })
}

function initMap() {
  if (!mapContainer.value) return

  map = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.9285, lng: 138.6007 }, // Adelaide
    zoom: 12
  })

  isMapLoaded.value = true
}

function addMarker(position, title) {
  if (!map) return null

  try {
    const marker = new google.maps.Marker({
      position,
      map,
      title
    })

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

function focusMap(position, title = '') {
  if (!map) return

  // Clear previous markers
  clearMarkers()

  // Add new marker and focus on it
  const marker = addMarker(position, title)
  map.panTo(position)
  map.setZoom(14)

  // Add animation to the marker
  if (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(() => marker.setAnimation(null), 1500)
  }
}

onMounted(async () => {
  try {
    await waitForGoogleMaps()
    initMap()
  } catch (error) {
    console.error('Failed to initialize map:', error)
    isMapLoaded.value = false
  }
})

defineExpose({
  focusMap,
  isMapLoaded,
  addMarker
})
</script>