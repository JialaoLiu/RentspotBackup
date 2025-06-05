<template>
  <div class="grid-view">
    <div
      v-for="property in properties"
      :key="property.id"
      class="grid-property-card"
      @click="$emit('view-property', property.id)"
    >
      <div class="card-image-container">
        <img :src="property.image" :alt="property.title" @error="handleImageError">
        <div class="property-badge" v-if="property.status === 0">Available</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ property.title }}</h3>
        <p class="card-address">{{ property.address }}</p>
        <div class="card-features">
          <span class="feature-item">
            <Icon name="bed" size="md" />
            {{ property.bedrooms }}
          </span>
          <span class="feature-separator">•</span>
          <span class="feature-item">
            <Icon name="bathroom" size="md" />
            {{ property.bathrooms }}
          </span>
          <span v-if="property.garage" class="feature-separator">•</span>
          <span v-if="property.garage" class="feature-item">
            <Icon name="car" size="md" />
            {{ property.garage }}
          </span>
        </div>
        <div class="card-footer">
          <span class="card-price">${{ property.price }}<span class="per-week">/week</span></span>
          <button class="card-btn">View</button>
          <button 
            class="favorite-btn-small" 
            :class="{ 'is-favorited': isFavorite(property.id) }"
            @click.stop="$emit('toggle-favorite', property.id)"
          >
            <Icon 
              :name="isFavorite(property.id) ? 'heart' : 'heart-outline'" 
              size="sm" 
              :color="isFavorite(property.id) ? '#EF4444' : '#9CA3AF'"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '../Common/Icon.vue'
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

// Image error handler
function handleImageError(e) {
  e.target.src = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'
}

// Check if property is favorited
function isFavorite(propertyId) {
  return props.favorites.includes(propertyId)
}
</script>

<style scoped>
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
  border-color: #374151;
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
  flex-wrap: wrap;
  gap: 8px;
}

.card-features .feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-features .feature-separator {
  margin: 0 4px;
  gap: 6px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-weight: 700;
  color: #4B5563;
}

.per-week {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6B7280;
}

.card-btn {
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.card-btn:hover {
  background-color: #1F2937;
}

.favorite-btn-small {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.favorite-btn-small:hover {
  background-color: #F3F4F6;
}

</style>