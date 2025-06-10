<template>
  <div class="error-container">
    <p>{{ message }}</p>
    <button @click="$emit('retry')" class="retry-button" v-if="showRetry">Try Again</button>
    <button @click="$emit('back')" class="back-button">Go Back</button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Something went wrong'
  },
  showRetry: {
    type: Boolean,
    default: false
  }
})

defineEmits(['retry', 'back'])
</script>

<style scoped>
.error-container {
  text-align: center;
  padding: 100px 0;
  color: var(--color-danger);
}

.retry-button, .back-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-top: 20px;
  margin-left: 10px;
  margin-right: 10px;
  transition: background-color var(--transition-fast);
}

.retry-button:hover, .back-button:hover {
  background-color: var(--color-primary-hover);
}
</style>