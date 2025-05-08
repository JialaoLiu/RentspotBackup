<template>
  <h2>Exploring Property:</h2>
  <div class="property-list px-4 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="(property, index) in properties"
      :key="index"
      @click="() => emit('focus-map', { lat: property.lat, lng: property.lng })"
    >
      <PropertyCard
        :title="property.title"
        :address="property.address"
        :price="property.price"
        :image="property.image"
      />
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import PropertyCard from './PropertyCard.vue'

const emit = defineEmits(['focus-map'])

const properties = [
  {
    title: 'Modern Apartment in CBD',
    address: '123 King William St, Adelaide',
    price: 480,
    image: 'https://source.unsplash.com/random/800x600/?apartment',
    lat: -34.925,
    lng: 138.6007
  },
  {
    title: 'Spacious House with Garden',
    address: '55 Greenhill Rd, Parkside',
    price: 620,
    image: 'https://source.unsplash.com/random/800x601/?house',
    lat: -34.944,
    lng: 138.618
  },
  {
    title: 'Cozy Studio near Uni',
    address: '8 Frome Rd, Adelaide',
    price: 380,
    image: 'https://source.unsplash.com/random/800x602/?studio',
    lat: -34.917,
    lng: 138.607
  }
]
</script>

<style scoped>
.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}
</style>