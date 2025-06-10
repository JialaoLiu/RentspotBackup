<template>
  <div class="view-selector">
    <button 
      @click="$emit('update:mode', 'detailed')" 
      :class="{ active: mode === 'detailed' }">
      Detailed List
    </button>
    <button 
      @click="$emit('update:mode', 'grid')" 
      :class="{ active: mode === 'grid' }">
      Grid View
    </button>
    <button 
      @click="$emit('update:mode', 'map')" 
      :class="{ active: mode === 'map' }">
      Map View
    </button>
  </div>
</template>

<script setup>
// Import required
defineProps({
  mode: {
    type: String,
    required: true
  }
})

defineEmits(['update:mode'])
</script>

<style scoped>
.view-selector {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  justify-content: center;
}

.view-selector button {
  padding: 8px 16px;
  background-color: var(--color-bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-medium);
  transition: all var(--transition-fast);
}

.view-selector button:hover {
  background-color: var(--color-border);
  border-color: var(--color-primary);
}

.view-selector button.active {
  background-color: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}
</style>