<template>
  <div class="property-description">
    <h2>Description</h2>
    <div v-if="description" class="description-content">
      <p v-for="(paragraph, index) in descriptionParagraphs" :key="index">
        {{ paragraph }}
      </p>
    </div>
    <p v-else class="no-description">No description available for this property.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  description: String
})

const descriptionParagraphs = computed(() => {
  if (!props.description) return []
  return props.description.split('\n').filter(p => p.trim() !== '')
})
</script>

<style scoped>
.property-description {
  margin-bottom: 30px;
}

.property-description h2 {
  margin-bottom: 16px;
  font-size: 1.5rem;
  color: #1f2937;
}

.description-content {
  line-height: 1.6;
  color: #4b5563;
}

.description-content p {
  margin-bottom: 16px;
}

.no-description {
  color: #6b7280;
  font-style: italic;
}
</style>