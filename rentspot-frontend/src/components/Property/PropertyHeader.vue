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
        <Icon 
          :name="isFavorite ? 'heart' : 'heart-outline'" 
          size="md"
          :color="isFavorite ? '#EF4444' : '#9CA3AF'"
        />
      </button>
      <button class="share-button" @click="shareProperty" aria-label="Share property">
        <Icon name="share" size="md" color="#6B7280" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import Icon from '../Common/Icon.vue'

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
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--color-dark);
}

.property-address {
  color: var(--color-medium);
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.property-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.property-type {
  display: inline-block;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.favorite-button, .share-button {
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.favorite-button:hover, .share-button:hover {
  background-color: var(--color-bg-secondary);
}

.favorite-button.is-favorite {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger);
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