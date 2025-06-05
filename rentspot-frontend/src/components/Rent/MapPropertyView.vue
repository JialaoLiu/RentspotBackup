<template>
  <div class="map-view">
    <!-- Map Controls -->
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
          <Icon name="search" size="md" /> Filters
        </button>
        <button class="list-view-button" @click="$emit('change-view', 'grid')">
          <span class="list-icon">≡</span> List
        </button>
      </div>
      <div class="update-map-toggle">
        <input type="checkbox" id="update-map" v-model="updateAsItMoves">
        <label for="update-map">Update map as it moves</label>
      </div>
    </div>
    
    <!-- Main Map Container -->
    <div class="map-container" @click="handleMapContainerClick">
      <MapDisplay 
        ref="mapRef"
        :properties="properties"
        :visitedProperties="visitedProperties"
        :updateAsItMoves="updateAsItMoves"
        @marker-click="handleMarkerClick"
        @bounds-changed="handleBoundsChanged"
        @property-visited="$emit('property-visited', $event)"
      />
    </div>
    
    <!-- Property popup when marker is clicked -->
    <div v-if="selectedProperty" class="map-property-popup">
      <div class="popup-carousel">
        <img :src="selectedProperty.image" :alt="selectedProperty.title" @error="handleImageError">
        <div class="carousel-controls">
          <button class="carousel-prev">
            <Icon name="arrow-left" size="md" />
          </button>
          <button class="carousel-next">
            <Icon name="arrow-right" size="md" />
          </button>
        </div>
      </div>
      
      <div class="popup-content">
        <div class="popup-type">{{ getPropertyTypeText(selectedProperty.type) }}</div>
        <div class="popup-price">${{ selectedProperty.price }} / Wk</div>
        <div class="popup-address">
          {{ selectedProperty.address }}
        </div>
        <div class="popup-features">
          <div class="feature">
            <Icon name="bed" size="md" />
            <span class="feature-value">{{ selectedProperty.bedrooms }}</span>
          </div>
          <div class="feature">
            <Icon name="bathroom" size="md" />
            <span class="feature-value">{{ selectedProperty.bathrooms }}</span>
          </div>
          <div v-if="selectedProperty.garage" class="feature">
            <Icon name="car" size="md" />
            <span class="feature-value">{{ selectedProperty.garage }}</span>
          </div>
        </div>
        <button class="view-details-btn" @click="$emit('view-property', selectedProperty.id)">
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapDisplay from '../MapDisplay.vue'
import Icon from '../Common/Icon.vue'

// Props
const props = defineProps({
  properties: {
    type: Array,
    required: true
  },
  visitedProperties: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['change-view', 'view-property', 'property-visited'])

// Local state
const mapRef = ref(null)
const selectedProperty = ref(null)
const updateAsItMoves = ref(true)

// Property type helper
function getPropertyTypeText(typeCode) {
  const types = {
    0: 'HOUSE FOR RENT',
    1: 'APARTMENT FOR RENT',
    2: 'TOWNHOUSE FOR RENT',
    3: 'VILLA FOR RENT'
  }
  return types[typeCode] || 'PROPERTY FOR RENT'
}

// Image error handler
function handleImageError(e) {
  e.target.src = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'
}

// Update handleMarkerClick to mark property as visited
function handleMarkerClick(property) {
  selectedProperty.value = property
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
  console.log('Map bounds updated:', bounds)
  // Here you would typically filter properties or fetch new ones based on bounds
}
</script>

<style scoped>
.map-view {
  position: relative;
  height: 100%;
  width: 100%;
}

/* Map Controls - Compact horizontal toolbar */
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
  color: #4B5563;
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
  color: #6B7280;
}

.popup-features .feature {
  display: flex;
  align-items: center;
  gap: 4px;
}

.feature-icon-small {
  font-size: 16px;
}

.feature-value {
  font-size: 16px;
  font-weight: 500;
  color: #6B7280;
}

.view-details-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.view-details-btn:hover {
  background-color: #1F2937;
}

@media (max-width: 768px) {
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