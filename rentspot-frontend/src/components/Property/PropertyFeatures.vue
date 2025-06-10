<template>
  <div class="property-features">
    <div class="feature">
      <Icon name="bed" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ bedrooms }}</span>
      <span class="feature-label">Bedrooms</span>
    </div>
    <div class="feature">
      <Icon name="bathroom" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ bathrooms }}</span>
      <span class="feature-label">Bathrooms</span>
    </div>
    <div class="feature" v-if="garages !== undefined">
      <Icon name="car" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ garages }}</span>
      <span class="feature-label">Parking</span>
    </div>
    <div class="feature">
      <Icon name="house" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ propertyType }}</span>
      <span class="feature-label">Type</span>
    </div>
    <div class="feature" v-if="landSize">
      <Icon name="ruler" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ landSize }}</span>
      <span class="feature-label">Land Size</span>
    </div>
    <div class="feature" v-if="buildYear">
      <Icon name="construction" size="lg" :color="'var(--text-secondary)'" />
      <span class="feature-value">{{ buildYear }}</span>
      <span class="feature-label">Built</span>
    </div>
  </div>
  
  <div class="property-amenities" v-if="amenities && amenities.length > 0">
    <h3>Amenities</h3>
    <ul class="amenities-list">
      <li v-for="(amenity, index) in amenities" :key="index" class="amenity-item">
        <Icon name="check" size="sm" color="#10b981" />
        {{ amenity }}
      </li>
    </ul>
  </div>
</template>

<script setup>
// Import Icon component
import Icon from '../Common/Icon.vue'


defineProps({
  bedrooms: Number,
  bathrooms: Number,
  garages: Number,
  propertyType: String,
  landSize: String,
  buildYear: Number,
  amenities: Array
})
</script>

<style scoped>
.property-features {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--surface-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.feature .icon {
  margin-bottom: 8px;
}

.feature-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.feature-label {
  color: var(--text-secondary);
}

.property-amenities {
  margin-bottom: 30px;
}

.property-amenities h3 {
  font-size: 1.3rem;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.amenities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  list-style: none;
  padding: 0;
}

.amenity-item {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.amenity-item .icon {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .property-features {
    gap: 10px;
  }
  
  .feature {
    min-width: 90px;
  }
  
  .amenities-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

</style>