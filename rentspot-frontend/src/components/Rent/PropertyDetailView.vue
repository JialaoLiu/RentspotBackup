<template>
  <div class="property-content">
    <PropertyHeader 
      :title="property.title" 
      :address="property.address" 
      :price="property.price" 
      :propertyType="getPropertyType(property.type)"
      @favorite="$emit('toggle-favorite')" 
      :isFavorite="isFavorite" 
    />
    
    <div class="property-main">
      <div class="property-left-column">
        <PropertyImageGallery 
          :propertyId="property.id" 
          :propertyTitle="property.title" 
          :initialImages="propertyImages" 
          :editable="isOwner" 
          @images-updated="handleImagesUpdated"
          @primary-image-changed="handlePrimaryImageChanged"
        />
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
</template>

<script setup>
import { computed } from 'vue'
import PropertyHeader from '../Property/PropertyHeader.vue'
import PropertyImageGallery from '../Property/PropertyImageGallery.vue'
import PropertyFeatures from '../Property/PropertyFeatures.vue'
import PropertyDescription from '../Property/PropertyDescription.vue'
import PropertyLocation from '../Property/PropertyLocation.vue'
import PropertyAgent from '../Property/PropertyAgent.vue'
import PropertyInspection from '../Property/PropertyInspection.vue'
import SimilarProperties from '../Property/SimilarProperties.vue'

// Props
const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  agentInfo: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['toggle-favorite', 'images-updated'])

// Check if current user is the owner
const isOwner = computed(() => {
  // Get user ID from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}')
  return userData.id === props.property.owner_id
})

// Property images
const propertyImages = computed(() => {
  // First check if images were passed as props
  if (props.images && props.images.length > 0) {
    return props.images
  }
  
  // Then check if property has images array
  if (props.property.images && Array.isArray(props.property.images)) {
    return props.property.images
  }
  
  // If only one image exists
  if (props.property.image) {
    return [{ 
      id: 0,
      propertyId: props.property.id,
      url: props.property.image, 
      isPrimary: true,
      orderIndex: 0
    }]
  }
  
  return []
})

// Handle images updated
function handleImagesUpdated(newImages) {
  // Emit to parent so it can update state
  emit('images-updated', newImages)
}

// Handle primary image changed
function handlePrimaryImageChanged(image) {
  // Update the primary image
  if (props.property) {
    props.property.image = image.url
  }
}

// Helper functions
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
  const parts = address.split(',')
  return parts.length > 1 ? parts[parts.length - 2].trim() : ''
}
</script>

<style scoped>
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