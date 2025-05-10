<template>
  <div style="padding: 0 20px; margin-top: 20px;">
    <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 16px;">Available Properties</h2>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
      <div
        v-for="(property, index) in properties"
        :key="index"
        @click="() => selectProperty(property)"
        style="cursor: pointer; transition: transform 0.2s; border: 2px solid transparent;"
        :style="property.id === selectedPropertyId ? 'border-color: #3b82f6; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);' : ''"
      >
        <PropertyCard
          :title="property.title"
          :address="property.address"
          :price="property.price"
          :image="property.image"
          :bedrooms="property.bedrooms"
          :bathrooms="property.bathrooms"
        />
      </div>
    </div>

    <div v-if="properties.length === 0" style="text-align: center; padding: 40px 0;">
      <p style="color: #6b7280;">No properties found matching your criteria.</p>
    </div>
  </div>
</template>

<script setup>
import PropertyCard from './PropertyCard.vue'

defineProps({
  properties: {
    type: Array,
    default: () => []
  },
  selectedPropertyId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['focus-map'])

function selectProperty(property) {
  emit('focus-map', property)
}
</script>

<style scoped>
.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}
</style>