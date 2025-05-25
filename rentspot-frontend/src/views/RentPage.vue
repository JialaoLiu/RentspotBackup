<template>
  <div class="rentpage-container">
    <!-- Loading state -->
    <LoadingState v-if="loading" message="Loading property details..." />
    
    <!-- Error state -->
    <ErrorState 
      v-else-if="error" 
      :message="error" 
      @back="goBack" 
    />
    
    <!-- Property details -->
    <PropertyDetailView 
      v-else-if="property" 
      :property="property" 
      :isFavorite="isFavorite"
      :agentInfo="agentInfo"
      @toggle-favorite="toggleFavorite"
    />
    
    <!-- Property not found -->
    <ErrorState 
      v-else 
      message="Property Not Found. Sorry, we couldn't find the property you were looking for." 
      @back="goBack" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from '../composables/useRouter.js'
import { getPropertyById } from '../services/propertyService'

// Import components
import LoadingState from '../components/Rent/LoadingState.vue'
import ErrorState from '../components/Rent/ErrorState.vue'
import PropertyDetailView from '../components/Rent/PropertyDetailView.vue'

const router = useRouter()
const route = useRoute()

const property = ref(null)
const loading = ref(true)
const error = ref(null)
const agentInfo = ref({
  name: 'Property Manager',
  email: 'agent@rentspot.com.au',
  phone: '(08) 1234 5678',
  photo: null
})

// Auth check
const isAuthenticated = ref(!!localStorage.getItem('token'))

// Check if property is in favorites
const isFavorite = computed(() => {
  if (!isAuthenticated.value || !property.value) return false
  
  const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]')
  return favorites.includes(property.value.id)
})

// Load property data
onMounted(async () => {
  const id = parseInt(route.value.params.id)
  
  if (!id) {
    error.value = 'Invalid property ID'
    loading.value = false
    return
  }
  
  try {
    // Get property from API
    console.log(`Getting property ${id}`)
    const data = await getPropertyById(id)
    console.log('Property data:', data)
    
    if (!data) {
      error.value = 'Property not found'
      loading.value = false
      return
    }
    
    property.value = data
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to load property details. Please try again later.'
  } finally {
    loading.value = false
  }
})

// Add/remove from favorites
function toggleFavorite() {
  if (!isAuthenticated.value) {
    // Redirect to login if not logged in
    router.push({ 
      name: 'Login', 
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]')
  
  if (isFavorite.value) {
    // Remove from favorites
    const index = favorites.indexOf(property.value.id)
    favorites.splice(index, 1)
  } else {
    // Add to favorites
    favorites.push(property.value.id)
  }
  
  localStorage.setItem('favoriteProperties', JSON.stringify(favorites))
}

// Go back to previous page
function goBack() {
  router.back()
}
</script>

<style scoped>
.rentpage-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>