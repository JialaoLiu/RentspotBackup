<template>
  <div class="property-features">
    <div class="feature">
      <BedIcon class="feature-icon" />
      <span class="feature-value">{{ bedrooms }}</span>
      <span class="feature-label">Bedrooms</span>
    </div>
    <div class="feature">
      <BathroomIcon class="feature-icon" />
      <span class="feature-value">{{ bathrooms }}</span>
      <span class="feature-label">Bathrooms</span>
    </div>
    <div class="feature" v-if="garages !== undefined">
      <CarIcon class="feature-icon" />
      <span class="feature-value">{{ garages }}</span>
      <span class="feature-label">Parking</span>
    </div>
    <div class="feature">
      <HouseIcon class="feature-icon" />
      <span class="feature-value">{{ propertyType }}</span>
      <span class="feature-label">Type</span>
    </div>
    <div class="feature" v-if="landSize">
      <RulerIcon class="feature-icon" />
      <span class="feature-value">{{ landSize }}</span>
      <span class="feature-label">Land Size</span>
    </div>
    <div class="feature" v-if="buildYear">
      <ConstructionIcon class="feature-icon" />
      <span class="feature-value">{{ buildYear }}</span>
      <span class="feature-label">Built</span>
    </div>
  </div>
  
  <div class="property-amenities" v-if="amenities && amenities.length > 0">
    <h3>Amenities</h3>
    <ul class="amenities-list">
      <li v-for="(amenity, index) in amenities" :key="index" class="amenity-item">
        <CheckIcon class="checkmark" />
        {{ amenity }}
      </li>
    </ul>
  </div>
</template>

<script setup>
// Import SVG icons
import BedIcon from '../../assets/svg/Bed.svg'
import BathroomIcon from '../../assets/svg/Bathroom.svg'
import CarIcon from '../../assets/svg/car.svg'
import HouseIcon from '../../assets/svg/House.svg'
import RulerIcon from '../../assets/svg/Ruler.svg'
import ConstructionIcon from '../../assets/svg/Construction.svg'
import CheckIcon from '../../assets/svg/Check.svg'

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
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.feature-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #6B7280;
}

.feature-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.feature-label {
  color: #6b7280;
}

.property-amenities {
  margin-bottom: 30px;
}

.property-amenities h3 {
  font-size: 1.3rem;
  margin-bottom: 16px;
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
}

.checkmark {
  width: 16px;
  height: 16px;
  color: #10b981;
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