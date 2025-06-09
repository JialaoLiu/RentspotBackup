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
      :ownerInfo="ownerInfo"
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
import { getPropertyById, addFavorite, removeFavorite, checkFavorite } from '../services/propertyService'
import { useNotification } from '../composables/useNotification'

// Import components
import LoadingState from '../components/Rent/LoadingState.vue'
import ErrorState from '../components/Rent/ErrorState.vue'
import PropertyDetailView from '../components/Rent/PropertyDetailView.vue'

const router = useRouter()
const route = useRoute()
const toast = useNotification()

const property = ref(null)
const loading = ref(true)
const error = ref(null)
const isFavoriteState = ref(false)

// Auth check
const isAuthenticated = ref(!!localStorage.getItem('token'))

// Check if property is in favorites
const isFavorite = computed(() => isFavoriteState.value)

// Get owner information from property
const ownerInfo = computed(() => {
  if (!property.value) {
    return {
      name: 'Property Owner',
      email: 'owner@example.com',
      phone: '',
      avatar: null
    }
  }
  
  return {
    name: property.value.owner_name || 'Property Owner',
    email: property.value.owner_email || 'owner@example.com',
    phone: property.value.owner_phone || '',
    avatar: property.value.owner_avatar || null
  }
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
    
    // Check favorite status if authenticated
    if (isAuthenticated.value) {
      try {
        isFavoriteState.value = await checkFavorite(id)
      } catch (err) {
        console.error('Failed to check favorite status:', err)
        // Don't show error, just default to false
      }
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to load property details. Please try again later.'
  } finally {
    loading.value = false
  }
})

// Add/remove from favorites
async function toggleFavorite() {
  if (!isAuthenticated.value) {
    // Redirect to login if not logged in
    router.push('/login?redirect=' + encodeURIComponent(route.value.fullPath))
    return
  }
  
  try {
    if (isFavoriteState.value) {
      // Remove from favorites
      await removeFavorite(property.value.id)
      isFavoriteState.value = false
      toast.success('Removed from favorites')
    } else {
      // Add to favorites
      await addFavorite(property.value.id)
      isFavoriteState.value = true
      toast.success('Added to favorites')
    }
  } catch (error) {
    console.error('Failed to update favorites:', error)
    toast.error('Failed to update favorites. Please try again.')
  }
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