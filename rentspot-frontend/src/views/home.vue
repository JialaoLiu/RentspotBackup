<template>
  <div style="margin-top: 20px;">
    <SearchBar @search="handleSearch" />

    <div v-if="loading" style="text-align: center; margin: 20px 0;">
      <p>Loading properties...</p>
    </div>

    <div v-else-if="error" style="background-color: #ffebee; border: 1px solid #f44336; color: #b71c1c; padding: 12px; border-radius: 4px; margin: 20px 0;">
      {{ error }}
    </div>

    <div v-else>
      <MapDisplay ref="mapRef" />
      <!-- PropertyList component temporarily removed and moved to RentList.vue -->
      <!-- 
      <PropertyList
        :properties="properties"
        :selectedPropertyId="selectedPropertyId"
        @focus-map="handleFocusMap"
      />
      -->
    </div>
    
    <!-- Blog Section -->
    <div style="margin-top: 40px;">
      <h2>Blogs</h2>
      <div v-if="loadingBlogs" style="text-align: center; margin: 20px 0;">
        <p>Loading blogs...</p>
      </div>
      <div v-else-if="errorBlogs" style="background-color: #ffebee; border: 1px solid #f44336; color: #b71c1c; padding: 12px; border-radius: 4px; margin: 20px 0;">
        {{ errorBlogs }}
      </div>
      <div v-else>
        <BlogList :blogs="blogs" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Keep the import but comment out its usage below
import { fetchProperties } from '../services/propertyService'
import SearchBar from '../components/SearchBar.vue'
import MapDisplay from '../components/MapDisplay.vue'
// Keep the import but comment out its usage below
import PropertyList from '../components/PropertyList.vue'
import { fetchBlogs } from '../services/BlogService.js'
import BlogList from '../components/BlogList.vue'

const router = useRouter()
const properties = ref([])
const loading = ref(false) // Changed to false since we're not loading properties anymore
const error = ref(null)
const mapRef = ref(null)
const selectedPropertyId = ref(null)

// States for managing blogs
const blogs = ref([])
const loadingBlogs = ref(false)
const errorBlogs = ref(null)

// Comment out this function instead of removing it
/*
async function loadProperties() {
  loading.value = true
  error.value = null

  try {
    properties.value = await fetchProperties()
  } catch (err) {
    error.value = 'Failed to load properties. Please try again later.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
*/

async function loadBlogs() {
  loadingBlogs.value = true
  errorBlogs.value = null

  try {
    blogs.value = await fetchBlogs()
  } catch (err) {
    errorBlogs.value = 'Failed to load blogs. Please try again later.'
    console.error(err)
  } finally {
    loadingBlogs.value = false
  }
}

function handleSearch(searchParams) {
  console.log('Search params:', searchParams)
  // Redirect to RentList page with search params
  router.push({
    path: '/rentlist',
    query: searchParams
  })
}

// Comment out this function instead of removing it
/*
function handleFocusMap(property) {
  selectedPropertyId.value = property.id

  if (mapRef.value) {
    mapRef.value.focusMap(
      { lat: parseFloat(property.lat), lng: parseFloat(property.lng) },
      property.title
    )
  }
}
*/

onMounted(() => {
  // Remove the loadProperties call since we're not showing properties on home page anymore
  // loadProperties()
  
  // Load blogs on component mount
  loadBlogs()
  
  // Initialize map if needed
  if (mapRef.value) {
    // You could set default map location here
  }
})
</script>