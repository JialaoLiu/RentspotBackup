<template>
  <div class="property-header">
    <div class="header-content">
      <h1>{{ title }}</h1>
      <p class="property-address">{{ address }}</p>
      <div class="property-price">${{ formatPrice(price) }}/week</div>
      <div class="property-type">{{ propertyType }}</div>
    </div>
    <div class="header-actions">
      <button 
        class="favorite-button" 
        :class="{ 'is-favorite': isFavorite }"
        @click="$emit('favorite')"
        aria-label="Add to favorites"
      >
        <span v-if="isFavorite">❤️</span>
        <span v-else>🤍</span>
      </button>
      <button class="share-button" @click="shareProperty" aria-label="Share property">
        <span>🔗</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: String,
  address: String,
  price: Number,
  propertyType: String,
  isFavorite: Boolean
})

defineEmits(['favorite'])

function formatPrice(price) {
  return price.toLocaleString()
}

function shareProperty() {
  // Implementation for property sharing
  // Could use navigator.share API or copy link to clipboard
  if (navigator.share) {
    navigator.share({
      title: props.title,
      text: `Check out this ${props.propertyType}: ${props.title}`,
      url: window.location.href,
    })
  } else {
    // Fallback to copy to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Could not copy text: ', err))
  }
}
</script>

<style scoped>
.property-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #1f2937;
}

.property-address {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.property-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 4px;
}

.property-type {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.favorite-button, .share-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.favorite-button:hover, .share-button:hover {
  background-color: #f9fafb;
}

.favorite-button.is-favorite {
  background-color: #fee2e2;
  border-color: #fecaca;
}

@media (max-width: 640px) {
  .property-header {
    flex-direction: column;
  }
  
  .header-actions {
    margin-top: 16px;
  }
}
</style>