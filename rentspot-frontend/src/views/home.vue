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
      <!-- PropertyList moved to RentList.vue -->
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
import { useRouter } from '../composables/useRouter.js'
import SearchBar from '../components/SearchBar.vue'
import MapDisplay from '../components/MapDisplay.vue'
import { fetchBlogs } from '../services/BlogService.js'
import BlogList from '../components/BlogList.vue'

const router = useRouter()
const loading = ref(false) // No properties
const error = ref(null)
const mapRef = ref(null)

// Blogs
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

async function handleSearch(searchParams) {
  console.log('Search params:', searchParams)
  // Redirect
  await router.push({
    path: '/rentlist',
    query: searchParams
  })
}

// Unused
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
  // Skip properties
  // loadProperties()
  
  // Blogs
  loadBlogs()
  
  // Map init
  if (mapRef.value) {
    // Default location
  }
})
</script>