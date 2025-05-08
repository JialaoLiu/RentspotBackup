
<template>
  <div class="property-card">
    <img :src="image" alt="Property Image" class="property-image" />
    <div class="property-details">
      <h3 class="property-title">{{ title }}</h3>
      <p class="property-address">{{ address }}</p>
      <p class="property-price">${{ price }}/week</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  address: String,
  price: Number,
  image: String
})
</script>

<style scoped>
.property-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid black;;
}

.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.property-details {
  padding: 16px;
}

.property-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.property-address {
  font-size: 14px;
  color: #666;
}

.property-price {
  font-size: 16px;
  font-weight: bold;
  color: #007BFF;
  margin-top: 8px;
}
</style>