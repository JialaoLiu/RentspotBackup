<template>
  <div class="mt-20">
    <SearchBar />
    <MapDisplay ref="mapRef" />
    <PropertyList @focus-map="handleFocusMap" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchBar from '../components/SearchBar.vue'
import MapDisplay from '../components/MapDisplay.vue'
import PropertyList from '../components/PropertyList.vue'

const mapRef = ref(null)

function handleFocusMap(position) {
  if (mapRef.value && typeof mapRef.value.focusMap === 'function') {
    mapRef.value.focusMap(position)
  }
}
</script>
