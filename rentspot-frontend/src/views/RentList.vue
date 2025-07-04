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
import { fetchProperties, addFavorite, removeFavorite } from '../services/propertyService.js'
import { getUserFavorites } from '../services/userService.js'
import { useNotification } from '../composables/useNotification'

// Components
import ViewModeSelector from '../components/Rent/ViewModeSelector.vue'
import DetailedPropertyList from '../components/Rent/DetailedPropertyList.vue'
import GridPropertyList from '../components/Rent/GridPropertyList.vue'
import MapPropertyView from '../components/Rent/MapPropertyView.vue'
import LoadingState from '../components/Rent/LoadingState.vue'
import NoProperties from '../components/Rent/NoProperties.vue'

const router = useRouter();
const route = useRoute();
const toast = useNotification();
let viewMode = ref('grid'); // Default view mode
const properties = ref([]);
const loading = ref(true);
let favorites = ref([]); // user favorites
let visitedProperties = ref([]); // visited property tracking
const isAuthenticated = ref(!!localStorage.getItem('token'));

/*
 * Toggle favorite status for property
 * handles authentication check and API calls
 */
async function toggleFavorite(propertyId) {
  // console.log('Toggling favorite for property:', propertyId); // useful for debugging
  
  if (!isAuthenticated.value) {
    // redirect to login with current page as return url
    router.push("/login?redirect=" + encodeURIComponent(route.value.fullPath));
    return;
  }
  
  try {
    let index = favorites.value.indexOf(propertyId);
    if (index === -1) {
      // add to favorites
      await addFavorite(propertyId);
      favorites.value.push(propertyId);
      toast.success('Added to favorites');
      // console.log('Property added to favorites'); // track success
    } else {
      // remove from favorites
      await removeFavorite(propertyId);
      favorites.value.splice(index, 1);
      toast.success('Removed from favorites');
      // console.log('Property removed from favorites'); // track success
    }
  } catch (error) {
    console.error('Failed to update favorites:', error);
    toast.error('Failed to update favorites. Please try again.');
    // TODO: need to implement retry mechanism for failed favorite operations!
  }
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

// initialization - load data
onMounted(async () => {
  // console.log('RentList component mounted'); // track component lifecycle
  // console.log('Auth status:', isAuthenticated.value); // debug auth issues
  
  try {
    // Load favorites from backend if authenticated
    if (isAuthenticated.value) {
      try {
        const userFavorites = await getUserFavorites();
        // Extract property IDs from the favorites array
        favorites.value = userFavorites.map(fav => fav.id);
        // console.log('Loaded favorites:', favorites.value.length); // track favorites count
        // console.log('Favorites data:', userFavorites); // keeping this for debugging
      } catch (error) {
        console.error('Failed to load favorites:', error);
        // Don't show error, just use empty array
        // FIXME: should we show a warning to user about favorites not loading?
      }
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
    console.log("Getting properties...") // keep this for now, useful for debugging
    const fetchedData = await fetchProperties()
    console.log("Properties:", fetchedData) // keep this too
    
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
  background-color: var(--surface-primary);
}
</style>