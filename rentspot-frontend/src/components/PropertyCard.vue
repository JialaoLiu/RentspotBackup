<template>
  <div class="property-card">
    <img
      :src="image"
      alt="Property Image"
      class="property-image"
      @error="handleImageError"
    />
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

function handleImageError(e) {
  // load cloudinary default image
  e.target.src = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'
}
</script>

<style scoped>
.property-card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-dark);
}

.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.property-details {
  padding: var(--space-md);
}

.property-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-dark);
  margin-bottom: var(--space-xs);
}

.property-address {
  font-size: 14px;
  color: var(--color-medium);
  margin-bottom: var(--space-sm);
}

.property-price {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-primary);
  margin-top: var(--space-sm);
}
</style>