<template>
  <div class="owner-section">
    <h2>Contact Property Owner</h2>
    <div class="owner-details">
      <div class="owner-photo">
        <img 
          v-if="ownerInfo.avatar" 
          :src="ownerInfo.avatar" 
          :alt="ownerInfo.name"
          @error="handlePhotoError" 
        >
        <div v-else class="owner-placeholder">👤</div>
      </div>
      <div class="owner-info">
        <h3>{{ ownerInfo.name }}</h3>
        <p>Email: {{ ownerInfo.email }}</p>
        <p v-if="ownerInfo.phone">Phone: {{ ownerInfo.phone }}</p>
      </div>
    </div>
    <div class="contact-buttons">
      <a :href="`mailto:${ownerInfo.email}`" class="email-button">Email Owner</a>
      <a v-if="ownerInfo.phone" :href="`tel:${ownerInfo.phone}`" class="call-button">Call Owner</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ownerInfo: {
    type: Object,
    required: true
  }
})

function handlePhotoError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.owner-section {
  padding: 20px;
  background-color: var(--surface-secondary);
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.owner-section h2 {
  margin-bottom: 16px;
  font-size: 1.3rem;
  color: var(--text-primary);
}

.owner-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.owner-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--surface-elevated);
}

.owner-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.owner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--text-tertiary);
}

.owner-info h3 {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.owner-info p {
  margin-bottom: 6px;
  color: var(--text-secondary);
}

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-buttons a {
  padding: 12px 0;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.email-button {
  background-color: var(--surface-elevated);
  color: var(--text-primary);
}

.email-button:hover {
  background-color: var(--interactive-primary);
  color: white;
}

.call-button {
  background-color: var(--interactive-primary);
  color: white;
}

.call-button:hover {
  background-color: var(--interactive-primary-hover);
}

@media (max-width: 768px) {
  .owner-details {
    flex-direction: row;
    align-items: center;
  }
}
</style>