<template>
    <div class="rent-list-container">
      <!-- View mode selector -->
      <div class="view-selector">
        <button 
          @click="viewMode = 'detailed'" 
          :class="{ active: viewMode === 'detailed' }">
          Detailed List
        </button>
        <button 
          @click="viewMode = 'grid'" 
          :class="{ active: viewMode === 'grid' }">
          Grid View
        </button>
        <button 
          @click="viewMode = 'map'" 
          :class="{ active: viewMode === 'map' }">
          Map View
        </button>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="loading" class="loading">
        Loading properties...
      </div>
      
      <!-- Detailed List View -->
      <div v-else-if="viewMode === 'detailed'" class="detailed-view">
        <div 
          v-for="property in properties" 
          :key="property.id" 
          class="detailed-property"
          @click="viewPropertyDetail(property.id)">
          <div class="property-image">
            <img :src="property.image" :alt="property.title">
          </div>
          <div class="property-info">
            <h3>{{ property.title }}</h3>
            <p class="address">{{ property.address }}</p>
            <div class="property-features">
              <span>{{ property.bedrooms }} bedrooms</span>
              <span>{{ property.bathrooms }} bathrooms</span>
            </div>
            <p class="description">{{ property.description }}</p>
            <div class="property-footer">
              <span class="price">${{ property.price }}/week</span>
              <button class="view-details-btn">View Details</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid-view">
        <PropertyCard 
          v-for="property in properties"
          :key="property.id"
          :title="property.title"
          :address="property.address"
          :price="property.price"
          :image="property.image"
          :bedrooms="property.bedrooms"
          :bathrooms="property.bathrooms"
          @click="viewPropertyDetail(property.id)"
        />
      </div>
      
      <!-- Map View -->
      <div v-else-if="viewMode === 'map'" class="map-view">
        <MapDisplay 
          ref="mapRef"
          :properties="properties"
          @marker-click="handleMarkerClick"
        />
        
        <!-- Property popup when marker is clicked -->
        <div v-if="selectedProperty" class="map-popup">
          <button class="close-popup" @click="selectedProperty = null">×</button>
          <img :src="selectedProperty.image" :alt="selectedProperty.title">
          <h3>{{ selectedProperty.title }}</h3>
          <p class="popup-price">${{ selectedProperty.price }}/week</p>
          <p class="popup-address">{{ selectedProperty.address }}</p>
          <div class="popup-features">
            <span>{{ selectedProperty.bedrooms }} bed</span>
            <span>{{ selectedProperty.bathrooms }} bath</span>
          </div>
          <button class="view-details-btn" @click="viewPropertyDetail(selectedProperty.id)">
            View Details
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { fetchProperties } from '../services/propertyService'
  import PropertyCard from '../components/PropertyCard.vue'
  import MapDisplay from '../components/MapDisplay.vue'
  
  const router = useRouter()
  const route = useRoute()
  const viewMode = ref('grid') // Default view mode
  const mapRef = ref(null)
  const selectedProperty = ref(null)
  const properties = ref([])
  const loading = ref(true)
  
  function viewPropertyDetail(propertyId) {
    router.push(`/rentpage/${propertyId}`)
  }
  
  function handleMarkerClick(property) {
    selectedProperty.value = property
  }
  
  // Load properties on component mount
  onMounted(async () => {
    try {
      // Check if there are any query parameters to filter by
      const queryParams = route.query
      
      // Fetch properties from service
      properties.value = await fetchProperties()
      
      // Filter properties based on query parameters
      if (Object.keys(queryParams).length > 0) {
        // This is a simple example - you would implement more sophisticated filtering
        if (queryParams.keyword) {
          const keyword = queryParams.keyword.toLowerCase()
          properties.value = properties.value.filter(p => 
            p.title.toLowerCase().includes(keyword) || 
            p.address.toLowerCase().includes(keyword) || 
            p.description.toLowerCase().includes(keyword)
          )
        }
      }
      
      // Add markers to map if in map view
      if (viewMode.value === 'map' && mapRef.value) {
        setTimeout(() => {
          addMapMarkers()
        }, 300)
      }
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      loading.value = false
    }
  })
  
  // Add property markers to map
  function addMapMarkers() {
    if (mapRef.value && properties.value.length > 0) {
      properties.value.forEach(property => {
        if (property.lat && property.lng) {
          const position = { lat: property.lat, lng: property.lng }
          mapRef.value.addMarker(position, property.title, () => {
            handleMarkerClick(property)
          })
        }
      })
    }
  }
  
  // Watch for view mode changes to update map
  watch(viewMode, (newMode) => {
    if (newMode === 'map' && mapRef.value) {
      // Add slight delay to ensure map is rendered
      setTimeout(() => {
        addMapMarkers()
      }, 300)
    }
  })
  </script>
  
  <style scoped>
  .rent-list-container {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;
  }
  
  .view-selector {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;
  }
  
  .view-selector button {
    padding: 8px 16px;
    background-color: #f3f4f6;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .view-selector button.active {
    background-color: #3b82f6;
    color: white;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #666;
  }
  
  /* Detailed View Styles */
  .detailed-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .detailed-property {
    display: flex;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    cursor: pointer;
  }
  
  .property-image {
    width: 250px;
    height: 200px;
    flex-shrink: 0;
  }
  
  .property-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .property-info {
    padding: 16px;
    flex-grow: 1;
  }
  
  .property-info h3 {
    margin-top: 0;
    font-size: 1.25rem;
    margin-bottom: 8px;
  }
  
  .address {
    color: #666;
    margin-bottom: 8px;
  }
  
  .property-features {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .description {
    margin-bottom: 16px;
  }
  
  .property-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .price {
    font-size: 1.25rem;
    font-weight: bold;
    color: #3b82f6;
  }
  
  .view-details-btn {
    padding: 8px 16px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* Grid View Styles */
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  /* Map View Styles */
  .map-view {
    position: relative;
    height: 600px;
  }
  
  .map-popup {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 300px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 15px;
    z-index: 100;
  }
  
  .map-popup img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .map-popup h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  
  .popup-price,
  .popup-address {
    margin: 4px 0;
  }
  
  .popup-features {
    display: flex;
    gap: 12px;
    margin: 8px 0;
    color: #666;
    font-size: 14px;
  }
  
  .close-popup {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  </style>