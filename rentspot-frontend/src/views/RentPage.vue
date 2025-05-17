<template>
  <div class="rentpage-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
      <p>Loading property details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back</button>
    </div>
    
    <!-- Property details -->
    <div v-else-if="property" class="property-content">
      <PropertyHeader 
        :title="property.title" 
        :address="property.address" 
        :price="property.price" 
        :propertyType="getPropertyType(property.type)"
        @favorite="toggleFavorite" 
        :isFavorite="isFavorite" 
      />
      
      <div class="property-main">
        <div class="property-left-column">
          <PropertyGallery :images="propertyImages" />
          <PropertyFeatures 
            :bedrooms="property.bedrooms" 
            :bathrooms="property.bathrooms" 
            :garages="property.garages" 
            :propertyType="getPropertyType(property.type)" 
            :landSize="property.landSize"
            :buildYear="property.buildYear"
          />
          <PropertyDescription :description="property.description" />
          <PropertyLocation 
            :lat="property.lat" 
            :lng="property.lng" 
            :address="property.address" 
          />
          <SimilarProperties :propertyType="property.type" :suburb="getSuburb(property.address)" />
        </div>
        
        <div class="property-right-column">
          <PropertyAgent :agentInfo="agentInfo" />
          <PropertyInspection :propertyId="property.id" :address="property.address" />
        </div>
      </div>
    </div>
    
    <!-- Property not found -->
    <div v-else class="not-found">
      <h2>Property Not Found</h2>
      <p>Sorry, we couldn't find the property you were looking for.</p>
      <button @click="goBack" class="back-button">Back to Listings</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPropertyById } from '../services/propertyService'

// Import components - Fixed import paths to match your folder structure
import LoadingSpinner from '../components/Common/LoadingSpinner.vue'
import PropertyHeader from '../components/Property/PropertyHeader.vue'
import PropertyGallery from '../components/Property/PropertyGallery.vue'
import PropertyFeatures from '../components/Property/PropertyFeatures.vue'
import PropertyDescription from '../components/Property/PropertyDescription.vue'
import PropertyLocation from '../components/Property/PropertyLocation.vue'
import PropertyAgent from '../components/Property/PropertyAgent.vue'
import PropertyInspection from '../components/Property/PropertyInspection.vue'
import SimilarProperties from '../components/Property/SimilarProperties.vue'

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

// Temporary auth store
const authStore = {
  isAuthenticated: ref(!!localStorage.getItem('token'))
}

// Temporary favorites store
const favoritesStore = {
  isFavorite: (id) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]')
    return favorites.includes(id)
  },
  addFavorite: (id) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]')
    if (!favorites.includes(id)) {
      favorites.push(id)
      localStorage.setItem('favoriteProperties', JSON.stringify(favorites))
    }
  },
  removeFavorite: (id) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProperties') || '[]')
    const index = favorites.indexOf(id)
    if (index !== -1) {
      favorites.splice(index, 1)
      localStorage.setItem('favoriteProperties', JSON.stringify(favorites))
    }
  }
}

// Computed properties
const propertyImages = computed(() => {
  if (!property.value) return []
  
  // If multiple images exist, return the array
  if (property.value.images && Array.isArray(property.value.images)) {
    return property.value.images
  }
  
  // If only one image exists
  return [{ url: property.value.image, alt: property.value.title }]
})

const isFavorite = computed(() => {
  if (!authStore.isAuthenticated.value || !property.value) return false
  return favoritesStore.isFavorite(property.value.id)
})

onMounted(async () => {
  const id = parseInt(route.params.id)
  
  if (!id) {
    error.value = 'Invalid property ID'
    loading.value = false
    return
  }
  
  try {
    // Get property details
    console.log(`Getting property ${id}`)
    const data = await getPropertyById(id)
    console.log('Property data:', data)
    
    if (!data) {
      error.value = 'Property not found'
      loading.value = false
      return
    }
    
    property.value = data
    
    // Default agent info
    agentInfo.value = {
      name: 'Property Manager',
      email: 'agent@rentspot.com.au',
      phone: '(08) 1234 5678',
      photo: null
    }
    
  } catch (err) {
    console.error('Error:', err)
    error.value = 'Failed to load property details. Please try again later.'
  } finally {
    loading.value = false
  }
})

function getPropertyType(typeCode) {
  const types = {
    0: 'House',
    1: 'Apartment',
    2: 'Townhouse',
    3: 'Villa'
  }
  
  return types[typeCode] || 'Property'
}

function getSuburb(address) {
  // Simple function to extract suburb from address
  // In a real app, this would be more sophisticated
  const parts = address.split(',')
  return parts.length > 1 ? parts[parts.length - 2].trim() : ''
}

function toggleFavorite() {
  if (!authStore.isAuthenticated.value) {
    // Redirect to login if not authenticated
    router.push({ 
      name: 'Login', 
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  
  if (isFavorite.value) {
    favoritesStore.removeFavorite(property.value.id)
  } else {
    favoritesStore.addFavorite(property.value.id)
  }
}

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

.loading-container, .error-container, .not-found {
  text-align: center;
  padding: 100px 0;
}

.error-container {
  color: #d32f2f;
}

.back-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.property-content {
  margin-bottom: 40px;
}

.property-main {
  display: flex;
  gap: 30px;
  margin-top: 20px;
}

.property-left-column {
  flex: 1;
}

.property-right-column {
  width: 320px;
}

@media (max-width: 768px) {
  .property-main {
    flex-direction: column;
  }
  
  .property-right-column {
    width: 100%;
    order: -1; /* Show contact/inspection section first on mobile */
  }
}
</style>