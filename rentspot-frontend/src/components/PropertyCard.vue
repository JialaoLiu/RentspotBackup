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
});

const handleImageError = (e) => {
  // console.log('Image failed to load, using fallback'); // debug image loading issues
  // fallback to cloudinary default - reliable CDN
  e.target.src = "https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png";
  // TODO: should add a loading placeholder instead of immediately showing default!
};
</script>

<style scoped>
.property-card {
  background-color: var(--surface-elevated);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-secondary);
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
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.property-address {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.property-price {
  font-size: 16px;
  font-weight: bold;
  color: var(--interactive-primary);
  margin-top: var(--space-sm);
}
</style>