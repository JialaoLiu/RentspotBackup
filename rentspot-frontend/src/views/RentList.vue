<template>
  <div class="rent-list-container" :class="{ 'fullscreen-map-mode': viewMode === 'map' }">
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
      <div class="loading-spinner"></div>
      <p>Loading properties...</p>
    </div>
    
    <!-- Detailed List View -->
    <div v-else-if="viewMode === 'detailed'" class="detailed-view">
      <div 
        v-for="property in properties" 
        :key="property.id" 
        class="detailed-property"
        @click="viewPropertyDetail(property.id)">
        <div class="property-image">
          <img :src="property.image" :alt="property.title" @error="handleImageError">
          <div class="property-badge" v-if="property.status === 0">Available</div>
        </div>
        <div class="property-info">
          <h3 class="property-title">{{ property.title }}</h3>
          <p class="address">
            <i class="location-icon">📍</i>
            {{ property.address }}
          </p>
          <div class="property-features">
            <span><i class="feature-icon">🛏️</i> {{ property.bedrooms }} bedrooms</span>
            <span><i class="feature-icon">🚿</i> {{ property.bathrooms }} bathrooms</span>
            <span v-if="property.garages"><i class="feature-icon">🚗</i> {{ property.garages }} parking</span>
            <span v-if="property.type !== undefined"><i class="feature-icon">🏠</i> {{ getPropertyType(property.type) }}</span>
          </div>
          <p class="description" v-if="property.description">{{ property.description }}</p>
          <p class="description" v-else>Modern property in a convenient location with great amenities nearby. Contact us for more details!</p>
          <div class="property-footer">
            <span class="price">${{ property.price }}<span class="per-week">/week</span></span>
            <button class="view-details-btn">View Details</button>
            <button class="favorite-btn" @click.stop="toggleFavorite(property.id)">
              <i :class="['heart-icon', {'favorited': favorites.includes(property.id)}]">❤</i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid-view">
      <div
        v-for="property in properties"
        :key="property.id"
        class="grid-property-card"
        @click="viewPropertyDetail(property.id)"
      >
        <div class="card-image-container">
          <img :src="property.image" :alt="property.title" @error="handleImageError">
          <div class="property-badge" v-if="property.status === 0">Available</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ property.title }}</h3>
          <p class="card-address">{{ property.address }}</p>
          <div class="card-features">
            <span>{{ property.bedrooms }} bed</span>
            <span>•</span>
            <span>{{ property.bathrooms }} bath</span>
          </div>
          <div class="card-footer">
            <span class="card-price">${{ property.price }}<span class="per-week">/week</span></span>
            <button class="card-btn">View</button>
            <button class="favorite-btn-small" @click.stop="toggleFavorite(property.id)">
              <i :class="['heart-icon-small', {'favorited': favorites.includes(property.id)}]">❤</i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Map View - Fullscreen -->
    <div v-else-if="viewMode === 'map'" class="map-view">
      <!-- Map Controls - only visible in map view -->
      <div class="map-controls">
        <div class="map-search-area">
          <input type="text" placeholder="Map area" class="area-search">
        </div>
        <div class="property-counter">
          Showing {{ properties.length }} of {{ properties.length }} properties
        </div>
        <div class="map-filters">
          <button class="filter-button">Property type</button>
          <button class="filter-button">Price</button>
          <button class="filter-button">Bed</button>
          <button class="filter-button">
            <span class="filter-icon">🔍</span> Filters
          </button>
          <button class="list-view-button" @click="viewMode = 'grid'">
            <span class="list-icon">≡</span> List
          </button>
        </div>
        <div class="update-map-toggle">
          <input type="checkbox" id="update-map" v-model="updateMapAsItMoves">
          <label for="update-map">Update map as it moves</label>
        </div>
      </div>
      
      <!-- Main Map Container -->
      <div class="map-container" @click="handleMapContainerClick">
        <MapDisplay 
          ref="mapRef"
          :properties="properties"
          :visitedProperties="visitedProperties"
          :updateAsItMoves="updateMapAsItMoves"
          @marker-click="handleMarkerClick"
          @bounds-changed="handleBoundsChanged"
          @property-visited="markPropertyAsVisited"
        />
      </div>
      
      <!-- Property popup when marker is clicked -->
      <div v-if="selectedProperty" class="map-property-popup">
        <div class="popup-carousel">
          <img :src="selectedProperty.image" :alt="selectedProperty.title" @error="handleImageError">
          <div class="carousel-controls">
            <button class="carousel-prev">❮</button>
            <button class="carousel-next">❯</button>
          </div>
        </div>
        
        <div class="popup-content">
          <div class="popup-type">APARTMENT FOR RENT</div>
          <div class="popup-price">${{ selectedProperty.price }} / Wk</div>
          <div class="popup-address">
            {{ selectedProperty.address }}
          </div>
          <div class="popup-features">
            <div class="feature">
              <span class="feature-icon-small">🛏️</span>
              <span class="feature-value">{{ selectedProperty.bedrooms }}</span>
            </div>
            <div class="feature">
              <span class="feature-icon-small">🚿</span>
              <span class="feature-value">{{ selectedProperty.bathrooms }}</span>
            </div>
          </div>
          <button class="view-details-btn" @click="viewPropertyDetail(selectedProperty.id)">
            View Details
          </button>
        </div>
      </div>
    </div>
    
    <!-- No properties found -->
    <div v-else-if="properties.length === 0" class="no-properties">
      <div class="no-properties-icon">🏠</div>
      <h3>No properties found</h3>
      <p>Try adjusting your search filters or exploring other areas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchProperties } from '../services/propertyService.js'
import PropertyCard from '../components/PropertyCard.vue'
import MapDisplay from '../components/MapDisplay.vue'

const router = useRouter()
const route = useRoute()
const viewMode = ref('grid') // Default view mode
const mapRef = ref(null)
const selectedProperty = ref(null)
const properties = ref([])
const loading = ref(true)
const favorites = ref([]) // Track favorite properties
const visitedProperties = ref([]) // Track visited properties
const updateMapAsItMoves = ref(true) // Toggle for map updating

// Get property type from code
function getPropertyType(typeCode) {
  const types = {
    0: 'House',
    1: 'Apartment',
    2: 'Townhouse',
    3: 'Villa'
  }
  return types[typeCode] || 'Property'
}

// Handle image loading errors
function handleImageError(e) {
  e.target.src = 'https://via.placeholder.com/300x200?text=Property+Image'
}

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
  // Add to visited properties for gray marker
  if (!visitedProperties.value.includes(propertyId)) {
    visitedProperties.value.push(propertyId)
    localStorage.setItem('visitedProperties', JSON.stringify(visitedProperties.value))
  }
  
  router.push(`/rentpage/${propertyId}`)
}

// Add or update this function in RentList.vue
function markPropertyAsVisited(propertyId) {
  if (!visitedProperties.value.includes(propertyId)) {
    visitedProperties.value.push(propertyId)
    localStorage.setItem('visitedProperties', JSON.stringify(visitedProperties.value))
  }
}

// Update handleMarkerClick to mark property as visited
function handleMarkerClick(property) {
  selectedProperty.value = property
  
  // Mark property as visited when marker is clicked
  if (property && property.id) {
    markPropertyAsVisited(property.id)
  }
}

// Handle map container click to close popup
function handleMapContainerClick(event) {
  // Only close if clicking directly on the map (not on popup or markers)
  if (
    event.target.classList.contains('map-container') || 
    event.target.tagName === 'CANVAS' ||
    event.target.tagName === 'DIV' && event.target.parentNode.classList.contains('map-container')
  ) {
    selectedProperty.value = null
  }
}

// Handle map bounds changing
function handleBoundsChanged(bounds) {
  if (updateMapAsItMoves.value) {
    console.log('Map bounds updated:', bounds)
    // Here you would typically filter properties or fetch new ones based on bounds
  }
}

// Load properties on component mount
onMounted(async () => {
  try {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteProperties')
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
    
    // Load visited properties from localStorage
    const savedVisited = localStorage.getItem('visitedProperties')
    if (savedVisited) {
      visitedProperties.value = JSON.parse(savedVisited)
    }
    
    // Check if view mode is specified in query parameters
    if (route.query.view) {
      viewMode.value = route.query.view
    }
    
    // Check if there are any query parameters to filter by
    const queryParams = route.query
    
    // Fetch properties from service
    properties.value = await fetchProperties()
    
    // Filter properties based on query parameters
    if (Object.keys(queryParams).length > 0 && queryParams.keyword) {
      const keyword = queryParams.keyword.toLowerCase()
      properties.value = properties.value.filter(p => 
        p.title.toLowerCase().includes(keyword) || 
        p.address.toLowerCase().includes(keyword) || 
        (p.description && p.description.toLowerCase().includes(keyword))
      )
    }
    
    // Initialize map if in map view
    if (viewMode.value === 'map' && mapRef.value) {
      setTimeout(() => {
        if (mapRef.value && mapRef.value.addPropertyMarkers) {
          mapRef.value.addPropertyMarkers()
        }
      }, 300)
    }
  } catch (error) {
    console.error('Error loading properties:', error)
  } finally {
    loading.value = false
  }
})

// Watch for view mode changes to update map and URL
watch(viewMode, (newMode) => {
  // Update URL query parameter
  router.replace({
    query: { ...route.query, view: newMode }
  }).catch(() => {})
  
  // When switching to map view
  if (newMode === 'map' && mapRef.value) {
    setTimeout(() => {
      if (mapRef.value && mapRef.value.addPropertyMarkers) {
        mapRef.value.addPropertyMarkers()
      }
    }, 300)
  }
  
  // Reset selected property when changing views
  selectedProperty.value = null
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

/* View mode selector styling */
.view-selector {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  justify-content: center;
}

.view-selector button {
  padding: 8px 16px;
  background-color: #e0e7ff;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s ease;
}

.view-selector button:hover {
  background-color: #d1d5fb;
  border-color: #6366f1;
}

.view-selector button.active {
  background-color: #374151; /* Updated to neutral gray color */
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Loading state styling */
.loading {
  text-align: center;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #374151; /* Updated to neutral gray color */
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Detailed List View Styles */
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.detailed-property:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #374151; /* Updated to neutral gray color */
}

.property-image {
  width: 250px;
  height: 200px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.property-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.detailed-property:hover .property-image img {
  transform: scale(1.05);
}

.property-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #10B981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.property-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.property-title {
  margin-top: 0;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1F2937;
}

.address {
  color: #4B5563;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location-icon {
  font-size: 14px;
}

.property-features {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  color: #4B5563;
}

.feature-icon {
  font-size: 14px;
  margin-right: 4px;
}

.description {
  margin-bottom: 16px;
  color: #6B7280;
  line-height: 1.5;
  flex-grow: 1;
}

.property-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4B5563; /* Updated to neutral gray color */
}

.per-week {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6B7280;
}

.view-details-btn {
  padding: 8px 16px;
  background-color: #374151; /* Updated to neutral gray color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  min-width: 100px;
}

.view-details-btn:hover {
  background-color: #1F2937; /* Darker variant for hover */
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  font-size: 18px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background-color: #F3F4F6;
}

.heart-icon {
  opacity: 0.5;
  transition: all 0.2s ease;
}

.heart-icon.favorited {
  color: #EF4444;
  opacity: 1;
}

/* Grid View Styles */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.grid-property-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #E5E7EB;
}

.grid-property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: #374151; /* Updated to neutral gray color */
}

.card-image-container {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.card-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.grid-property-card:hover .card-image-container img {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-address {
  color: #4B5563;
  font-size: 0.875rem;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-features {
  display: flex;
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 12px;
  gap: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-weight: 700;
  color: #4B5563; /* Updated to neutral gray color */
}

.card-btn {
  background-color: #374151; /* Updated to neutral gray color */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.card-btn:hover {
  background-color: #1F2937; /* Darker variant for hover */
}

.favorite-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  font-size: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.heart-icon-small {
  opacity: 0.5;
  transition: all 0.2s ease;
}

.heart-icon-small.favorited {
  color: #EF4444;
  opacity: 1;
}

/* Map View Styles - Fullscreen */
.map-view {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Updated Map Controls - Compact horizontal toolbar */
.map-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 10px 16px;
  z-index: 10;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.map-search-area {
  flex: 0 0 250px;
}

.area-search {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 14px;
}

.property-counter {
  font-size: 14px;
  color: #6B7280;
  white-space: nowrap;
  margin-left: auto;
}

.map-filters {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.filter-button, .list-view-button {
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #D1D5DB;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  color: #616771;
}

.filter-button:hover, .list-view-button:hover {
  background-color: #F3F4F6;
}

.update-map-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 14px;
}

.update-map-toggle input {
  cursor: pointer;
}

/* Map container now takes into account compact controls */
.map-container {
  height: calc(100% - 60px);
  width: 100%;
  position: absolute;
  top: 60px;
}

/* Property Popup in Map View */
.map-property-popup {
  position: absolute;
  top: 50%;
  right: 50px;
  transform: translateY(-50%);
  width: 350px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  overflow: hidden;
  z-index: 20;
}

.popup-carousel {
  position: relative;
  height: 200px;
}

.popup-carousel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.carousel-prev, .carousel-next {
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
}

.popup-content {
  padding: 16px;
}

.popup-type {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.popup-price {
  font-size: 24px;
  font-weight: 700;
  color: #4B5563; /* Updated to neutral gray color */
  margin-bottom: 8px;
}

.popup-address {
  font-size: 15px;
  color: #4B5563;
  margin-bottom: 12px;
}

.popup-features {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.popup-features .feature {
  display: flex;
  align-items: center;
  gap: 5px;
}

.feature-icon-small {
  font-size: 16px;
}

.feature-value {
  font-size: 16px;
  font-weight: 500;
  color: #4B5563;
}

/* No properties found state */
.no-properties {
  text-align: center;
  padding: 60px 0;
  color: #6B7280;
}

.no-properties-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detailed-property {
    flex-direction: column;
  }
  
  .property-image {
    width: 100%;
    height: 200px;
  }
  
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  .property-footer {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .view-details-btn {
    order: -1;
    width: 100%;
  }
  
  .price {
    flex-basis: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .favorite-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  /* Map responsive styles */
  .map-controls {
    height: auto;
    flex-wrap: wrap;
    padding: 8px;
  }
  
  .map-search-area {
    flex: 1 1 100%;
    order: 1;
  }
  
  .property-counter {
    order: 3;
    margin-left: 0;
    width: 100%;
    text-align: center;
  }
  
  .map-filters {
    order: 2;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 8px;
  }
  
  .map-container {
    top: 120px; /* Adjust based on the height of wrapped controls */
    height: calc(100% - 120px);
  }
  
  .map-property-popup {
    right: 50%;
    transform: translate(50%, -50%);
    width: 90%;
    max-width: 350px;
  }
}
</style>

