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

// load blog articles for home page
function loadBlogs() {
  loadingBlogs.value = true;
  errorBlogs.value = null;
  
  // console.log('Loading blog articles...'); // track blog loading

  fetchBlogs().then(data => {
    blogs.value = data;
  }).catch(err => {
    errorBlogs.value = "Failed to load blogs. Please try again later.";
    console.error(err);
  }).finally(() => {
    loadingBlogs.value = false;
  });
}

// search redirect handler
const handleSearch = (searchParams) => {
  console.log('Search params:', searchParams); // useful for debugging search functionality
  // redirect to property listings with search parameters
  router.push({
    path: "/rentlist",
    query: searchParams
  });
};

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
  // console.log('Home page mounted'); // track page loads
  
  // skip properties loading here since they're loaded in RentList
  // loadProperties() // commented out when we moved property list to separate page
  
  // BUG: sometimes blog loading fails on slow connections, investigating
  loadBlogs();
  
  // map initialization happens automatically in MapDisplay component
  // copied from old implementation - don't touch unless broken
  if (mapRef.value) {
    // default location (Adelaide CBD)
  }
});
</script>