<template>
  <div class="detailed-view">
    <div 
      v-for="property in properties" 
      :key="property.id" 
      class="detailed-property"
      @click="$emit('view-property', property.id)">
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
          <button class="favorite-btn" @click.stop="$emit('toggle-favorite', property.id)">
            <i :class="['heart-icon', {'favorited': isFavorite(property.id)}]">❤</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  properties: {
    type: Array,
    required: true
  },
  favorites: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['view-property', 'toggle-favorite'])

// Property type helper
function getPropertyType(typeCode) {
  const types = {
    0: 'House',
    1: 'Apartment',
    2: 'Townhouse',
    3: 'Villa'
  }
  return types[typeCode] || 'Property'
}

// Image error handler
function handleImageError(e) {
  e.target.src = 'https://via.placeholder.com/300x200?text=Property+Image'
}

// Check if property is favorited
function isFavorite(propertyId) {
  return props.favorites.includes(propertyId)
}
</script>

<style scoped>
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
  border-color: #374151;
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
  color: #4B5563;
}

.per-week {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6B7280;
}

.view-details-btn {
  padding: 8px 16px;
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  min-width: 100px;
}

.view-details-btn:hover {
  background-color: #1F2937;
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

@media (max-width: 768px) {
  .detailed-property {
    flex-direction: column;
  }
  
  .property-image {
    width: 100%;
    height: 200px;
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
}
</style>