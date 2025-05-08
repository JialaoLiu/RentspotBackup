<template>
  <div class="mt-8 px-4">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Map Preview</h2>
    <div ref="mapContainer" style="width: 600px; height: 400px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px;" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const mapContainer = ref(null)
let map = null
let selectedMarker = null

onMounted(() => {
  if (window.google && window.google.maps) {
    map = new google.maps.Map(mapContainer.value, {
      center: { lat: -34.9285, lng: 138.6007 }, // Adelaide
      zoom: 12
    })
  } else {
    console.error('Google Maps API is not loaded.')
  }
})

function focusMap(position) {
  if (map) {
    map.panTo(position)
    map.setZoom(14)

    // Remove previous marker if exists
    if (selectedMarker) {
      selectedMarker.setMap(null)
    }

    // Add new marker
    selectedMarker = new google.maps.Marker({
      position,
      map,
      title: 'Selected Property'
    })
  }
}

defineExpose({ focusMap })
</script>
