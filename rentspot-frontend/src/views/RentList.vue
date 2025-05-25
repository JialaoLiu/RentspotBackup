<template>
  <div class="rent-list-container" :class="{ 'fullscreen-map-mode': viewMode === 'map' }">
    <!-- View selector -->
    <ViewModeSelector v-model:mode="viewMode" />
    
    <!-- Loading -->
    <LoadingState v-if="loading" message="Loading properties..." />
    
    <!-- Empty -->
    <NoProperties v-else-if="!loading && properties.length === 0" />
    
    <!-- Detailed -->
    <DetailedPropertyList 
      v-else-if="!loading && viewMode === 'detailed' && properties.length > 0" 
      :properties="properties" 
      :favorites="favorites"
      @view-property="viewPropertyDetail"
      @toggle-favorite="toggleFavorite"
    />
    
    <!-- Grid -->
    <GridPropertyList 
      v-else-if="!loading && viewMode === 'grid' && properties.length > 0" 
      :properties="properties" 
      :favorites="favorites"
      @view-property="viewPropertyDetail"
      @toggle-favorite="toggleFavorite"
    />
    
    <!-- Map -->
    <MapPropertyView 
      v-else-if="!loading && viewMode === 'map' && properties.length > 0" 
      :properties="properties" 
      :visitedProperties="visitedProperties"
      @change-view="viewMode = $event"
      @view-property="viewPropertyDetail"
      @property-visited="markPropertyAsVisited"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from '../composables/useRouter.js'
import { fetchProperties } from '../services/propertyService.js'

// Components
import ViewModeSelector from '../components/Rent/ViewModeSelector.vue'
import DetailedPropertyList from '../components/Rent/DetailedPropertyList.vue'
import GridPropertyList from '../components/Rent/GridPropertyList.vue'
import MapPropertyView from '../components/Rent/MapPropertyView.vue'
import LoadingState from '../components/Rent/LoadingState.vue'
import NoProperties from '../components/Rent/NoProperties.vue'

const router = useRouter()
const route = useRoute()
const viewMode = ref('grid') // Default
const properties = ref([])
const loading = ref(true)
const favorites = ref([]) // Favorites
const visitedProperties = ref([]) // Visited

// Toggle favorite
function toggleFavorite(propertyId) {
  const index = favorites.value.indexOf(propertyId)
  if (index === -1) {
    favorites.value.push(propertyId)
  } else {
    favorites.value.splice(index, 1)
  }
  // Save
  localStorage.setItem('favoriteProperties', JSON.stringify(favorites.value))
}

// View property
function viewPropertyDetail(propertyId) {
  // Mark visited
  markPropertyAsVisited(propertyId)
  router.push(`/rentpage/${propertyId}`)
}

// Mark visited
function markPropertyAsVisited(propertyId) {
  if (!visitedProperties.value.includes(propertyId)) {
    visitedProperties.value.push(propertyId)
    localStorage.setItem('visitedProperties', JSON.stringify(visitedProperties.value))
  }
}

// Init
onMounted(async () => {
  try {
    // Favorites
    const savedFavorites = localStorage.getItem('favoriteProperties')
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
    
    // Visited
    const savedVisited = localStorage.getItem('visitedProperties')
    if (savedVisited) {
      visitedProperties.value = JSON.parse(savedVisited)
    }
    
    // View mode
    if (route.value.query.view) {
      viewMode.value = route.value.query.view
    }
    
    // Fetch
    console.log("Getting properties...")
    const fetchedData = await fetchProperties()
    console.log("Properties:", fetchedData)
    
    // Process
    if (fetchedData && fetchedData.length > 0) {
      fetchedProperties.value = fetchedData
      
      // Filter
      filterProperties()
    } else {
      console.warn("No properties found")
      properties.value = []
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
})

// Filter
function filterProperties() {
  console.log('Filtering:', route.value.query)
  
  if (fetchedProperties.value && fetchedProperties.value.length > 0) {
    properties.value = [...fetchedProperties.value]
    
    const queryParams = route.value.query
    if (queryParams.keyword) {
      const keyword = queryParams.keyword.toLowerCase()
      console.log('Keyword:', keyword)
      properties.value = properties.value.filter(p => 
        p.title.toLowerCase().includes(keyword) || 
        p.address.toLowerCase().includes(keyword) || 
        (p.description && p.description.toLowerCase().includes(keyword))
      )
      console.log('Results:', properties.value.length)
    }
  }
}

// Storage
const fetchedProperties = ref([])

// Watch keyword
watch(() => route.value.query.keyword, () => {
  filterProperties()
})

// Watch view
watch(viewMode, (newMode) => {
  // Update URL
  router.replace({
    path: route.value.path,
    query: { ...route.value.query, view: newMode }
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