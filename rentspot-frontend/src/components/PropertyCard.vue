<template>
  <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="position: relative;">
      <img
        :src="image"
        :alt="title"
        style="width: 100%; height: 200px; object-fit: cover;"
        @error="handleImageError"
      />
      <div style="position: absolute; top: 0; right: 0; background-color: #3b82f6; color: white; padding: 4px 8px; font-weight: bold; font-size: 0.875rem;">
        ${{ price }}/week
      </div>
    </div>

    <div style="padding: 16px;">
      <h3 style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-top: 0;">{{ title }}</h3>
      <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 8px;">{{ address }}</p>

      <div style="display: flex; gap: 16px; margin-top: 8px;">
        <div v-if="bedrooms" style="display: flex; align-items: center; font-size: 0.875rem; color: #4b5563;">
          <span style="margin-right: 4px;">🛏️</span> {{ bedrooms }} bed
        </div>
        <div v-if="bathrooms" style="display: flex; align-items: center; font-size: 0.875rem; color: #4b5563;">
          <span style="margin-right: 4px;">🚿</span> {{ bathrooms }} bath
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  address: String,
  price: Number,
  image: String,
  bedrooms: Number,
  bathrooms: Number
})

function handleImageError(e) {
  // Fallback image if the property image fails to load
  e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image'
}
</script>