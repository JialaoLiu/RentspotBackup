<template>
  <div class="rent-list-container" :class="{ 'fullscreen-map-mode': viewMode === 'map' }">
    <!-- View mode selector -->
    <ViewModeSelector v-model:mode="viewMode" />
    
    <!-- Loading indicator -->
    <LoadingState v-if="loading" message="Loading properties..." />
    
    <!-- Detailed List View -->
    <DetailedPropertyList 
      v-else-if="viewMode === 'detailed'" 
      :properties="properties" 
      :favorites="favorites"
      @view-property="viewPropertyDetail"
      @toggle-favorite="toggleFavorite"
    />
    
    <!-- Grid View -->
    <GridPropertyList 
      v-else-if="viewMode === 'grid'" 
      :properties="properties" 
      :favorites="favorites"
      @view-property="viewPropertyDetail"
      @toggle-favorite="toggleFavorite"
    />
    
    <!-- Map View - Fullscreen -->
    <MapPropertyView 
      v-else-if="viewMode === 'map'" 
      :properties="properties" 
      :visitedProperties="visitedProperties"
      @change-view="viewMode = $event"
      @view-property="viewPropertyDetail"
      @property-visited="markPropertyAsVisited"
    />
    
    <!-- No properties found -->
    <NoProperties v-else-if="properties.length === 0" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchProperties } from '../services/propertyService.js'

// Import components
import ViewModeSelector from '../components/Rent/ViewModeSelector.vue'
import DetailedPropertyList from '../components/Rent/DetailedPropertyList.vue'
import GridPropertyList from '../components/Rent/GridPropertyList.vue'
import MapPropertyView from '../components/Rent/MapPropertyView.vue'
import LoadingState from '../components/Rent/LoadingState.vue'
import NoProperties from '../components/Rent/NoProperties.vue'

const router = useRouter()
const route = useRoute()
const viewMode = ref('grid') // Default view mode
const properties = ref([])
const loading = ref(true)
const favorites = ref([]) // Track favorite properties
const visitedProperties = ref([]) // Track visited properties

// Toggle favorite status for a property
function toggleFavorite(propertyId) {
  const index = favorites.value.indexOf(propertyId)
  if (index === -1) {
    favorites.value.push(propertyId)
  } else {
    favorites.value.splice(index, 1)
  }
  // Save to localStorage
  localStorage.setItem('favoriteProperties', JSON.stringify(favorites.value))
}

// Navigate to property detail page and mark as visited
function viewPropertyDetail(propertyId) {
  // Add to visited properties
  markPropertyAsVisited(propertyId)
  router.push(`/rentpage/${propertyId}`)
}

// Mark property as visited
function markPropertyAsVisited(propertyId) {
  if (!visitedProperties.value.includes(propertyId)) {
    visitedProperties.value.push(propertyId)
    localStorage.setItem('visitedProperties', JSON.stringify(visitedProperties.value))
  }
}

// Load everything when page opens
onMounted(async () => {
  try {
    // Get saved favorites
    const savedFavorites = localStorage.getItem('favoriteProperties')
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
    
    // Get visited properties
    const savedVisited = localStorage.getItem('visitedProperties')
    if (savedVisited) {
      visitedProperties.value = JSON.parse(savedVisited)
    }
    
    // Set view mode from URL
    if (route.query.view) {
      viewMode.value = route.query.view
    }
    
    // Get properties from API
    console.log("Getting properties...")
    const fetchedProperties = await fetchProperties()
    console.log("Properties:", fetchedProperties)
    
    // If we got properties, show them
    if (fetchedProperties && fetchedProperties.length > 0) {
      properties.value = fetchedProperties
      
      // Filter by keyword if provided
      const queryParams = route.query
      if (queryParams.keyword) {
        const keyword = queryParams.keyword.toLowerCase()
        properties.value = properties.value.filter(p => 
          p.title.toLowerCase().includes(keyword) || 
          p.address.toLowerCase().includes(keyword) || 
          (p.description && p.description.toLowerCase().includes(keyword))
        )
      }
    } else {
      console.warn("No properties found")
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
})

// Watch for view mode changes to update URL
watch(viewMode, (newMode) => {
  // Update URL query parameter
  router.replace({
    query: { ...route.query, view: newMode }
  }).catch(() => {})
})
</script>

<style scoped>
.rent-list-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  transition: all 0.3s ease;
}

/* Fullscreen map mode overrides default container styles */
.fullscreen-map-mode {
  max-width: 100%;
  margin: 0;
  padding: 0;
  height: calc(100vh - 60px); /* Adjust 60px to match your navbar height */
  position: fixed;
  top: 60px; /* Match to navbar height */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10; /* Lower than navbar z-index */
  background-color: white;
}
</style>