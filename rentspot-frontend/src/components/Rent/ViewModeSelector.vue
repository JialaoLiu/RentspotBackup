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
  background-color: #e0e7ff;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s ease;
}

.view-selector button:hover {
  background-color: #d1d5fb;
  border-color: #6366f1;
}

.view-selector button.active {
  background-color: #374151;
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>